<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import ExportPanel from '../components/ExportPanel.vue'
import { MAP_CENTER, MAP_ZOOM, getStyle, addTerrainToMap, removeTerrainFromMap } from '../lib/maplibre.js'

const mapEl = ref(null)
const map = shallowRef(null)

const pitch = ref(52)
const bearing = ref(-15)
const exaggeration = ref(1.5)
const terrainOn = ref(true)
const activeStyle = ref('outdoor')

function applyTerrain() {
  if (!map.value) return
  if (terrainOn.value) addTerrainToMap(map.value, exaggeration.value)
  else removeTerrainFromMap(map.value)
}

function onPitch() { map.value?.setPitch(pitch.value) }
function onBearing() { map.value?.setBearing(bearing.value) }

function onExaggeration() {
  if (map.value && terrainOn.value) {
    map.value.setTerrain({ source: 'terrain-dem', exaggeration: exaggeration.value })
  }
}

function toggleTerrain() {
  terrainOn.value = !terrainOn.value
  applyTerrain()
}

function switchStyle(name) {
  activeStyle.value = name
  map.value.setStyle(getStyle(name))
  map.value.once('style.load', () => {
    applyTerrain()
    map.value.setPitch(pitch.value)
    map.value.setBearing(bearing.value)
  })
}

function resetCamera() {
  pitch.value = 52
  bearing.value = -15
  map.value?.flyTo({ center: MAP_CENTER, zoom: MAP_ZOOM - 2, pitch: 52, bearing: -15, duration: 1200 })
}

onMounted(() => {
  map.value = new maplibregl.Map({
    container: mapEl.value,
    style: getStyle('outdoor'),
    center: MAP_CENTER,
    zoom: MAP_ZOOM - 2,
    pitch: pitch.value,
    bearing: bearing.value,
    maxPitch: 85,
    preserveDrawingBuffer: true,
  })

  map.value.addControl(new maplibregl.NavigationControl(), 'top-right')
  map.value.addControl(new maplibregl.ScaleControl({ maxWidth: 120 }), 'bottom-left')

  map.value.on('load', applyTerrain)

  map.value.on('pitch', () => { pitch.value = +map.value.getPitch().toFixed(0) })
  map.value.on('rotate', () => { bearing.value = +map.value.getBearing().toFixed(0) })
})

onUnmounted(() => { map.value?.remove() })
</script>

<template>
  <div class="view">
    <div ref="mapEl" class="map" />

    <div class="panel controls-panel">
      <div class="panel-title">Base Layer</div>
      <div class="btn-row">
        <button class="btn" :class="{ active: activeStyle === 'outdoor' }" @click="switchStyle('outdoor')">Outdoor</button>
        <button class="btn" :class="{ active: activeStyle === 'satellite' }" @click="switchStyle('satellite')">Satellite</button>
        <button class="btn" :class="{ active: activeStyle === 'street' }" @click="switchStyle('street')">Street</button>
      </div>

      <div class="divider" />
      <div class="panel-title">Camera</div>

      <div class="field">
        <div class="field-label">
          Pitch <span class="field-value">{{ pitch }}°</span>
        </div>
        <input type="range" min="0" max="85" v-model.number="pitch" @input="onPitch" />
      </div>

      <div class="field">
        <div class="field-label">
          Bearing <span class="field-value">{{ bearing }}°</span>
        </div>
        <input type="range" min="-180" max="180" v-model.number="bearing" @input="onBearing" />
      </div>

      <div class="divider" />
      <div class="panel-title">Terrain</div>

      <div class="field">
        <div class="field-label">
          Exaggeration <span class="field-value">{{ exaggeration }}×</span>
        </div>
        <input type="range" min="0.5" max="3" step="0.1" v-model.number="exaggeration" @input="onExaggeration" :disabled="!terrainOn" />
      </div>

      <div class="btn-row" style="margin-top:4px">
        <button class="btn" :class="{ active: terrainOn }" @click="toggleTerrain">
          3D Terrain {{ terrainOn ? 'On' : 'Off' }}
        </button>
        <button class="btn" @click="resetCamera">Reset</button>
      </div>
    </div>

    <ExportPanel :map="map" />
  </div>
</template>
