// Set MAP_CENTER to your town: [longitude, latitude]
export const MAP_CENTER =  [-122.29622983492014, 49.14683566500006];
// export const MISSION_MAP_CENTER = [-122.29622983492014, 49.14683566500006];
// export const BAMFIELD_MAP_CENTER = [-125.13556983623883, 48.835423570103465];
export const MAP_ZOOM = 13;


const KEY = import.meta.env.VITE_MAPTILER_KEY || null
export const hasMaptilerKey = !!KEY

const SATELLITE_FALLBACK_STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'satellite-layer', type: 'raster', source: 'satellite' }],
}

export function getStyle(name) {
  if (name === 'satellite' && !KEY) return SATELLITE_FALLBACK_STYLE
  if (!KEY) return 'https://demotiles.maplibre.org/style.json'
  const slugs = { street: 'streets-v2', satellite: 'satellite', outdoor: 'outdoor-v2' }
  return `https://api.maptiler.com/maps/${slugs[name] ?? 'streets-v2'}/style.json?key=${KEY}`
}

export function getTerrainSourceConfig() {
  if (KEY) {
    return {
      type: 'raster-dem',
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${KEY}`,
      tileSize: 256,
    }
  }
  return {
    type: 'raster-dem',
    tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 14,
    attribution: 'Terrain Tiles (AWS)',
  }
}

export function addTerrainToMap(map, exaggeration = 1.5) {
  if (!map.getSource('terrain-dem')) {
    map.addSource('terrain-dem', getTerrainSourceConfig())
  }
  const hasHillshade = map.getStyle().layers.some(l => l.type === 'hillshade')
  if (!hasHillshade) {
    map.addLayer({
      id: 'hillshade-overlay',
      type: 'hillshade',
      source: 'terrain-dem',
      paint: { 'hillshade-exaggeration': 0.45 },
    })
  }
  map.setTerrain({ source: 'terrain-dem', exaggeration })
}

export function removeTerrainFromMap(map) {
  map.setTerrain(null)
}
