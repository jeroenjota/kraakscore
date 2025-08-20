import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Tafel from '../views/Tafel.vue'

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/tafel/:id', name: 'tafel', component: Tafel }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router