import { ref } from 'vue'
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useLoginStore = defineStore(
  'loginStore',
  () => {
    const token = ref('')
    const getTokenInfo = () => jwtDecode(token.value)
    const isTokenExpired = () => {
      const { exp } = getTokenInfo()
      return exp! * 1000 < Date.now()
    }
    return { token, getTokenInfo, isTokenExpired }
  },
  {
    persist: true
  }
)
