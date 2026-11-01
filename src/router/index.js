import { createRouter, createWebHashHistory } from 'vue-router'
import FlatMapView from '../views/FlatMapView.vue'
import TopoView from '../views/TopoView.vue'
import GlobeView from '../views/GlobeView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/flat' },
    { path: '/flat', component: FlatMapView },
    { path: '/topo', component: TopoView },
    { path: '/globe', component: GlobeView },
  ],
})
