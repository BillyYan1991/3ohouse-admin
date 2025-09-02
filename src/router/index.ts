import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import IndexView from '../views/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Index', component: IndexView },
    { path: '/login', name: 'Login', component: LoginView },
  ],
})

export default router
