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
                <div class="mt-3">
                  <div class="d-flex justify-content-center">
                    <div id="googleBtn"></div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/auth'
import { setToken } from '@/utils/auth'

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter()

    const form = ref({ email: '', password: '' })
    const error = ref('')
    const base = import.meta.env.VITE_API_BASE
      ? (import.meta.env.VITE_API_BASE as string).replace(/\/$/, '')
      : '/api'


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
          await router.push({ name: 'Home' })
        }
      } catch (e) {
        error.value = (e as Error).message || '網路錯誤'
      }
    }

    let gsiInited = false

    function getGoogleIdApi() {
      const win = window as any
      return win.google?.accounts?.id as
        | {
          initialize: (opts: Record<string, any>) => void
          renderButton: (el: HTMLElement, opts: Record<string, any>) => void
        }
        | undefined
    }

    // 只載入一次 GSI script
    function loadGsiOnce(): Promise<void> {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-gsi]')
        if (existing) {
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', () => reject())
          return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.dataset.gsi = '1'
        script.onload = () => resolve()
        script.onerror = () => reject()
        document.head.appendChild(script)
      })
    }

    // Google callback（沿用你原本的流程）
    async function onGoogleCallback(resp: unknown) {
      try {
        const idToken = (resp as any)?.credential as string | undefined
        if (!idToken) throw new Error('Google 回傳的 credential 為空')

        const r = await fetch(`${base}/api/user/oauth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })

        if (!r.ok) {
          let msg = 'Google 登入失敗'
          try {
            const j = await r.json()
            msg = j.message || j.error || JSON.stringify(j)
          } catch {
            msg = await r.text()
          }
          throw new Error(msg)
        }

        const data = await r.json()
        const token =
          data.token || data.accessToken || data.auth_token || null
        if (!token) throw new Error('後端未回傳 token')

        try {
          setToken(token)
        } catch {
          localStorage.setItem('auth_token', token)
        }

        const redirect =
          (router.currentRoute.value.query.redirect as string) || null
        if (redirect) {
          await router.replace(redirect)
        } else {
          await router.replace({ name: 'Home' })
        }
      } catch (e: any) {
        error.value = e?.message || 'Google 登入處理失敗'
        console.error('google callback error', e)
      }
    }

    // ======= 你要呼叫的登入函式 =======
    async function startGoogleLogin() {
      error.value = ''

      const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || ''
      if (!googleClientId) {
        error.value = '缺少 Google client id，請設定 VITE_GOOGLE_CLIENT_ID'
        return
      }

      try {
        await loadGsiOnce()

        const idApi = getGoogleIdApi()
        if (!idApi) throw new Error('Google GSI 尚未可用')

        // initialize（一次就好）
        if (!gsiInited) {
          idApi.initialize({
            client_id: googleClientId,
            callback: onGoogleCallback,
          })

          // render 官方按鈕（行動裝置最穩）
          const el = document.getElementById('googleBtn')
          if (el) {
            idApi.renderButton(el, {
              theme: 'outline',
              size: 'large',
              width: 300,
            })
          }

          gsiInited = true
        }

        // ❌ 不要 prompt()
        // ❌ 不要 popup
        // Google 會在官方按鈕點擊時自動處理登入

      } catch (e: any) {
        error.value = e?.message || '載入 Google 登入套件失敗'
      }
    }


    // 如果後端在重導到 /login 時帶上 token，這邊會接收並儲存
    onMounted(() => {
      startGoogleLogin()
      const q = router.currentRoute.value.query
      const token = (q.token as string) || null
      if (token) {
        try {
          setToken(token)
        } catch (e) {
          console.error('set token error', e)
        }
        // 導回 redirect 或首頁
        const redirect = (q.redirect as string) || null
        if (redirect) {
          router.replace(redirect)
        } else {
          router.replace({ name: 'Home' })
        }
      }
    })

    return { form, error, onSubmit, onReset, startGoogleLogin }
  },
})
</script>

<style scoped>
/* minimal adjustments; project CSS lives in public/css/portal.css */
</style>
