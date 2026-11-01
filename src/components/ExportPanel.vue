<script setup>
import { ref, computed, watch } from 'vue'
import { exportAsPNG, exportAsJPEG, exportAsPDF, getCanvasInfo } from '../lib/export.js'

const props = defineProps({ map: Object })

const format = ref('png')
const pdfWidth = ref(18)
const pdfHeight = ref(24)
const exporting = ref(false)

const info = computed(() => props.map ? getCanvasInfo(props.map) : null)

async function doExport() {
  if (!props.map || exporting.value) return
  exporting.value = true
  try {
    if (format.value === 'png') await exportAsPNG(props.map)
    else if (format.value === 'jpg') await exportAsJPEG(props.map)
    else await exportAsPDF(props.map, 'map.pdf', pdfWidth.value, pdfHeight.value)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="panel export-panel">
    <div class="panel-title">Export</div>

    <div class="field">
      <div class="field-label">Format</div>
      <div class="btn-row">
        <button class="btn" :class="{ active: format === 'png' }" @click="format = 'png'">PNG</button>
        <button class="btn" :class="{ active: format === 'jpg' }" @click="format = 'jpg'">JPG</button>
        <button class="btn" :class="{ active: format === 'pdf' }" @click="format = 'pdf'">PDF</button>
      </div>
    </div>

    <div v-if="format === 'pdf'" class="field" style="margin-top:8px">
      <div class="field-label">Print size (inches)</div>
      <div class="btn-row">
        <button class="btn" :class="{ active: pdfWidth===18 && pdfHeight===24 }" @click="pdfWidth=18; pdfHeight=24">18×24</button>
        <button class="btn" :class="{ active: pdfWidth===24 && pdfHeight===36 }" @click="pdfWidth=24; pdfHeight=36">24×36</button>
        <button class="btn" :class="{ active: pdfWidth===36 && pdfHeight===48 }" @click="pdfWidth=36; pdfHeight=48">36×48</button>
      </div>
    </div>

    <button class="btn primary" style="width:100%;margin-top:10px" :disabled="exporting" @click="doExport">
      {{ exporting ? 'Exporting…' : 'Download' }}
    </button>

    <div v-if="info" class="export-info">
      <strong>{{ info.pixels }}</strong><br>
      @ 150 DPI → {{ info.at150dpi }}<br>
      @ 300 DPI → {{ info.at300dpi }}
    </div>
  </div>
</template>
