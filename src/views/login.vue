<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { loginConfirm } from '@/api/login'
import { useLoginStore } from '@/stores/modules/useLoginStore'
// import { sayHello } from '@/api/login'
// sayHello()
export interface RuleForm {
  username: string
  password: string
}
const ruleForm = reactive<RuleForm>({
  username: '',
  password: ''
})
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
  ]
})

const loginConfirmFn = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) {
      console.log('error submit!', fields)
      return
    }
  })
  const { data } = await loginConfirm(ruleForm)
  const loginStore = useLoginStore()
  loginStore.token = data
}
</script>
<template>
  <el-row class="login-page">
    <el-col :span="6" :offset="9" class="form">
      <el-form
        ref="ruleFormRef"
        class="form-content"
        :model="ruleForm"
        :rules="rules"
      >
        <el-form-item label="username" prop="username">
          <el-input
            placeholder="请输入用户名"
            v-model="ruleForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item label="password" prop="password">
          <el-input
            placeholder="请输入密码"
            type="password"
            v-model="ruleForm.password"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="loginBtn"
            @click="loginConfirmFn(ruleFormRef)"
            >login</el-button
          >
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>
.login-page {
  height: 100vh;

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .form-content {
      // padding: 10px 10px;
      // border: 1px solid #ccc;
      // border-radius: 5px;
    }

    .loginBtn {
      width: 100%;
    }
  }
}
</style>
