import router from '@/router'
import { useLoginStore } from '@/stores/modules/useLoginStore'
import axios from 'axios'

export const request = axios.create({
  baseURL: '/api',
  timeout: 50000
})
// 添加请求拦截器, 在发送请求之前做些什么
request.interceptors.request.use(
  function (config) {
    const loginStore = useLoginStore()
    if (loginStore.token) {
      config.headers.set('token', loginStore.token)
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    if (response.data.code === 401) {
      // token过期或不存在则跳转到登录页面
      router.push('/login')
    } else {
      router.push('/home')
    }
    return response
  },
  function (error) {
    console.log('error resp ...')
    return Promise.reject(error)
  }
)
