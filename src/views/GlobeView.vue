<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import ExportPanel from '../components/ExportPanel.vue'
import { MAP_CENTER, MAP_ZOOM, getStyle, addTerrainToMap } from '../lib/maplibre.js'

const mapEl = ref(null)
const map = shallowRef(null)
const playing = ref(false)
const speed = ref(1.0)
const activeStyle = ref('outdoor')
let animRaf = null
let orbitStart = null
let orbitPhase = 'zoomout' // 'zoomout' | 'orbit' | 'zoomin'

const WAYPOINTS = [
  { zoom: MAP_ZOOM - 1, pitch: 55, bearing: 0,   duration: 2500 },
  { zoom: MAP_ZOOM - 5, pitch: 40, bearing: 60,  duration: 5000 },
  { zoom: MAP_ZOOM - 5, pitch: 40, bearing: 180, duration: 6000 },
  { zoom: MAP_ZOOM - 5, pitch: 40, bearing: 300, duration: 6000 },
  { zoom: MAP_ZOOM - 1, pitch: 55, bearing: 360, duration: 4000 },
]

function chainFlyTo(idx = 0) {
  if (!playing.value || idx >= WAYPOINTS.length) {
    if (playing.value) chainFlyTo(0) // loop
    return
  }
  const { zoom, pitch, bearing, duration } = WAYPOINTS[idx]
  map.value.flyTo({
    center: MAP_CENTER, zoom, pitch, bearing,
    duration: duration / speed.value,
    essential: true,
  })
  map.value.once('moveend', () => chainFlyTo(idx + 1))
}

function play() {
  playing.value = true
  chainFlyTo(0)
}

function pause() {
  playing.value = false
  map.value?.stop()
}

function togglePlay() {
  if (playing.value) pause()
  else play()
}

function resetView() {
  pause()
  map.value?.flyTo({ center: MAP_CENTER, zoom: MAP_ZOOM - 1, pitch: 55, bearing: 0, duration: 1500 })
}

function switchStyle(name) {
  activeStyle.value = name
  const wasPl = playing.value
  pause()
  map.value.setStyle(getStyle(name))
  map.value.once('style.load', () => {
    addTerrainToMap(map.value, 1.5)
    setupAtmosphere()
    if (wasPl) play()
  })
}

function setupAtmosphere() {
  try {
    map.value.setFog({
      range: [0.5, 10],
      color: 'white',
      'horizon-blend': 0.1,
    })
  } catch { /* not supported in all style versions */ }
}

onMounted(() => {
  map.value = new maplibregl.Map({
    container: mapEl.value,
    style: getStyle('outdoor'),
    center: MAP_CENTER,
    zoom: MAP_ZOOM - 1,
    pitch: 55,
    bearing: 0,
    maxPitch: 85,
    preserveDrawingBuffer: true,
  })

  map.value.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.value.on('load', () => {
    // Enable globe projection
    try { map.value.setProjection('globe') } catch { /* v4 API might differ */ }

    addTerrainToMap(map.value, 1.5)
    setupAtmosphere()
  })
})

onUnmounted(() => {
  playing.value = false
  cancelAnimationFrame(animRaf)
  map.value?.remove()
})
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
      <div class="panel-title">Fly-through</div>

      <div class="btn-row">
        <button class="btn primary" @click="togglePlay" style="flex:1">
          {{ playing ? '⏸ Pause' : '▶ Play' }}
        </button>
        <button class="btn icon" @click="resetView" title="Reset view">↺</button>
      </div>

      <div class="field" style="margin-top:8px">
        <div class="field-label">
          Speed <span class="field-value">{{ speed.toFixed(1) }}×</span>
        </div>
        <input type="range" min="0.25" max="3" step="0.25" v-model.number="speed" />
      </div>
    </div>

    <ExportPanel :map="map" />
  </div>
</template>
