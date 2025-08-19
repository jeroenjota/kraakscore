import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import TableInput from '../views/Tafel.vue'

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/table/:id', name: 'table', component: TableInput }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router