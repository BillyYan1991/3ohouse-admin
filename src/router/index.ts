import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import IndexView from '../views/AppIndex.vue'
import HomeView from '../views/Home.vue'
import BookingForm from '../views/BookingForm.vue'
import CalendarForm from '../views/CalendarForm.vue'
import SpecialdayForm from '../views/SpecialdayForm.vue'
import SpecialdayNewForm from '../views/SpecialdayNewForm.vue'
import SpecialdayList from '../views/SpecialdayList.vue'
import FinancialForm from '@/views/FinancialForm.vue'
import NotFoundView from '../views/NotFound.vue'
import { isLoggedIn } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
    {
      path: '/',
      name: 'Index',
      component: IndexView,
      children: [
        {
          path: 'index',
          name: 'Home',
          component: HomeView,
        },
        {
          path: 'bookingForm/:id?',
          name: 'BookingForm',
          component: BookingForm,
        },
        {
          path: 'calendarForm/:id',
          name: 'CalendarForm',
          component: CalendarForm,
        },
        {
          path: 'specialDayList/:id',
          name: 'SpecialDayList',
          component: SpecialdayList,
        },
        {
          path: 'specialDayNewForm/:id?',
          name: 'SpecialDayNewForm',
          component: SpecialdayNewForm,
        },
        {
          path: 'specialDayForm/:id',
          name: 'SpecialDayForm',
          component: SpecialdayForm,
        },
        {
          path: 'financialForm',
          name: 'FinancialForm',
          component: FinancialForm,
        },
      ],
    },
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
