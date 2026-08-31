import { createRouter, createWebHistory } from 'vue-router'
import MapaEtapas from '@/views/estudiante/MapaEtapas.vue'

const routes = [
  {
    path: '/estudiante/mapa',
    name: 'mapa-estudiante',
    component: MapaEtapas,
  },
  {
    path: '/',
    redirect: '/estudiante/mapa',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
