import { request } from '@/utils/request'
import type { RuleForm } from '@/views/login.vue'
export const sayHello = () =>
  request
    .get('/hello?p2=true&p3=789')
    .then(function (response) {
      console.log(response)
    })
    .catch(function (error) {
      console.log(error)
    })
export const loginConfirm = (data: RuleForm) =>
  request.post('/user/login', data)
