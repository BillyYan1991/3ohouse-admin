import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import IndexView from '../views/Index.vue'
import NotFoundView from '../views/NotFound.vue'
import { isLoggedIn } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  { path: '/', name: 'Index', component: IndexView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
  ],
})

// 全域路由守衛：若路由不是 /login 或 NotFound 且未登入，導到 /login，並帶上 redirect 查詢參數
router.beforeEach((to, from, next) => {
  if (to.name === 'Login' || to.name === 'NotFound') return next()
  if (!isLoggedIn()) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  return next()
})

export default router
