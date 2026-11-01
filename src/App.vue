<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { hasMaptilerKey } from './lib/maplibre.js'
</script>

<template>
  <nav class="nav">
    <span class="nav-brand">MyMission</span>
    <div class="nav-links">
      <RouterLink to="/flat" class="nav-link">Flat</RouterLink>
      <RouterLink to="/topo" class="nav-link">Topo</RouterLink>
      <RouterLink to="/globe" class="nav-link">Globe</RouterLink>
    </div>
    <div class="nav-status" :class="hasMaptilerKey ? 'ok' : 'warn'">
      {{ hasMaptilerKey ? 'MapTiler ✓' : 'Demo tiles — add VITE_MAPTILER_KEY for full quality' }}
    </div>
  </nav>
  <RouterView />
</template>
