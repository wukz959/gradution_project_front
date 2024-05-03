import { useLoginStore } from '@/stores/modules/useLoginStore'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('../views/home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login.vue')
    },
    {
      path: '/home',
      name: '首页',
      component: () => import('../views/home.vue')
    }
  ]
})

router.beforeEach(async (to, from) => {
  const loginStore = useLoginStore()
  // 检查用户是否登录，并避免无限重定向
  if (
    to.name !== 'login' &&
    loginStore.token !== '' &&
    loginStore.isTokenExpired()
  ) {
    //to.name为上面routes相应模块的name，如/home的name为首页
    return { name: 'login' }
  }
})

export default router
