<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import ExportPanel from '../components/ExportPanel.vue'
import { MAP_CENTER, MAP_ZOOM, getStyle } from '../lib/maplibre.js'

const mapEl = ref(null)
const map = shallowRef(null)
const activeStyle = ref('street')
const zoom = ref(MAP_ZOOM.toFixed(1))

const STYLES = ['street', 'satellite', 'outdoor']

function switchStyle(name) {
  activeStyle.value = name
  map.value.setStyle(getStyle(name))
}

onMounted(() => {
  map.value = new maplibregl.Map({
    container: mapEl.value,
    style: getStyle('street'),
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    pitch: 0,
    bearing: 0,
    preserveDrawingBuffer: true,
  })
  map.value.addControl(new maplibregl.NavigationControl(), 'top-right')
  map.value.addControl(new maplibregl.ScaleControl({ maxWidth: 120 }), 'bottom-left')
  map.value.on('zoom', () => { zoom.value = map.value.getZoom().toFixed(1) })
})

onUnmounted(() => { map.value?.remove() })
</script>

<template>
  <div class="view">
    <div ref="mapEl" class="map" />

    <div class="panel controls-panel">
      <div class="panel-title">Style</div>
      <div class="btn-row">
        <button
          v-for="s in STYLES" :key="s"
          class="btn" :class="{ active: activeStyle === s }"
          @click="switchStyle(s)"
          style="text-transform:capitalize"
        >{{ s }}</button>
      </div>

      <div class="divider" />

      <div class="field-label">
        Zoom <span class="field-value">{{ zoom }}</span>
      </div>
    </div>

    <ExportPanel :map="map" />
  </div>
</template>
