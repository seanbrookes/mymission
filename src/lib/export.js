import { jsPDF } from 'jspdf'

function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality))
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function waitForIdle(map) {
  return new Promise(resolve => {
    if (map.loaded() && !map.isMoving()) resolve()
    else map.once('idle', resolve)
  })
}

export async function exportAsPNG(map, filename = 'map.png') {
  await waitForIdle(map)
  const blob = await canvasToBlob(map.getCanvas(), 'image/png')
  triggerDownload(blob, filename)
}

export async function exportAsJPEG(map, filename = 'map.jpg', quality = 0.95) {
  await waitForIdle(map)
  const blob = await canvasToBlob(map.getCanvas(), 'image/jpeg', quality)
  triggerDownload(blob, filename)
}

export async function exportAsPDF(map, filename = 'map.pdf', widthIn, heightIn) {
  await waitForIdle(map)
  const canvas = map.getCanvas()
  const aspect = canvas.width / canvas.height
  const w = widthIn
  const h = heightIn ?? widthIn / aspect
  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({
    orientation: w >= h ? 'landscape' : 'portrait',
    unit: 'in',
    format: [w, h],
  })
  pdf.addImage(imgData, 'JPEG', 0, 0, w, h)
  pdf.save(filename)
}

export function getCanvasInfo(map) {
  if (!map) return null
  const c = map.getCanvas()
  const w = c.width
  const h = c.height
  return {
    pixels: `${w} × ${h} px`,
    at150dpi: `${(w / 150).toFixed(1)}" × ${(h / 150).toFixed(1)}"`,
    at300dpi: `${(w / 300).toFixed(1)}" × ${(h / 300).toFixed(1)}"`,
  }
}
