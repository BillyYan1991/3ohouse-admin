<template>
  <div class="app app-login p-0">
    <div class="row g-0 app-auth-wrapper justify-content-center">
      <div class="col-12 col-md-7 col-lg-6 auth-main-col text-center p-5">
        <div class="d-flex flex-column align-content-end">
          <div class="app-auth-body mx-auto">
            <div class="app-auth-branding mb-4">

            </div>
            <h2 class="auth-heading text-center mb-4">品house後台系統</h2>
            <div class="auth-form-container text-start">
              <form @submit.prevent="onSubmit" @reset="onReset" class="auth-form login-form">
                <div class="mb-3">
                  <label class="sr-only" for="email">帳號</label>
                  <input id="email" v-model="form.email" name="email" class="form-control" placeholder="帳號" required />
                </div>
                <div class="password mb-3">
                  <label class="sr-only" for="password">密碼</label>
                  <input type="password" id="password" v-model="form.password" name="password"
                    class="form-control signin-password" placeholder="密碼" required />
                </div>
                <div class="row justify-content-between">
                  <div class="col-6">
                    <button type="submit" class="btn app-btn-primary w-100 theme-btn mx-auto">送出</button>
                  </div>
                  <div class="col-6">
                    <button type="reset" class="btn app-btn-primary w-100 theme-btn mx-auto">重設</button>
                  </div>
                </div>
                <div v-if="error" class="mt-3 text-danger">{{ error }}</div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/auth'

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter()

    const form = ref({ email: '', password: '' })
    const error = ref('')


    function onReset() {
      setTimeout(() => {
        form.value.email = ''
        form.value.password = ''
      }, 0)
    }

    async function onSubmit() {
      error.value = ''
      if (!form.value.email || !form.value.password) {
        error.value = '請輸入帳號與密碼'
        return
      }
      try {
        await login({ email: form.value.email, password: form.value.password })
        // 若有 redirect 查詢參數，導回該路徑
        const redirect = (router.currentRoute.value.query.redirect as string) || null
        if (redirect) {
          await router.replace(redirect)
        } else {
          await router.push({ name: 'Index' })
        }
      } catch (e) {
        error.value = (e as Error).message || '網路錯誤'
      }
    }

    return { form, error, onSubmit, onReset }
  },
})
</script>

<style scoped>
/* minimal adjustments; project CSS lives in public/css/portal.css */
</style>
