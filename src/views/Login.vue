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
                  <button type="button" class="btn btn-outline-danger w-100" @click="startGoogleLogin">
                    使用 Google 登入
                  </button>
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
    const base = ((import.meta.env.VITE_API_BASE as string) || '/api').replace(/\/$/, '')


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

    async function startGoogleLogin() {
      error.value = ''
      const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || ''
      if (!googleClientId) {
        error.value = '缺少 Google client id，請設定 VITE_GOOGLE_CLIENT_ID'
        return
      }

      // 動態載入 GSI 腳本（如果尚未載入）
      const ensureGsiLoaded = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          const win = window as unknown as Record<string, unknown>
          const googleObj = win['google'] as Record<string, unknown> | undefined
          const accounts = googleObj?.['accounts'] as Record<string, unknown> | undefined
          const idObj = accounts?.['id'] as Record<string, unknown> | undefined
          if (idObj && typeof idObj === 'object') return resolve()

          // 如果已經插入 <script data-gsi>，但尚未載入 google 物件，等候該 script 的 load/error
          const existing = document.querySelector('script[data-gsi]') as HTMLScriptElement | null
          if (existing) {
            existing.addEventListener('load', () => resolve())
            existing.addEventListener('error', () => reject(new Error('載入 Google GSI 失敗')))
            return
          }

          // 否則新增 script
          const script = document.createElement('script')
          script.setAttribute('src', 'https://accounts.google.com/gsi/client')
          script.setAttribute('defer', 'true')
          script.setAttribute('data-gsi', '1')
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('載入 Google GSI 失敗'))
          document.head.appendChild(script)
        })
      }

      try {
        await ensureGsiLoaded()

        const win = window as unknown as Record<string, unknown>
        // 初始化
        const googleObj = win['google'] as Record<string, unknown> | undefined
        const accountsObj = googleObj?.['accounts'] as Record<string, unknown> | undefined
        const idObj = accountsObj?.['id'] as Record<string, unknown> | undefined
        const initializeFn = idObj?.['initialize'] as ((opts: Record<string, unknown>) => void) | undefined
        const promptFn = idObj?.['prompt'] as (() => void) | undefined

        initializeFn?.({
          client_id: googleClientId,
          callback: async (resp: unknown) => {
            try {
              const idToken = (resp as Record<string, unknown>)['credential'] as string | undefined
              if (!idToken) throw new Error('Google 回傳的 credential 為空')

              // 丟給後端驗證 + 換你自己的 token
              const r = await fetch(`${base}/user/oauth/google`, {
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
              const token = data.token || data.accessToken || data.auth_token || null
              if (!token) throw new Error('後端未回傳 token')

              // 儲存 token（使用專案的 helper）
              try {
                setToken(token)
              } catch {
                // fallback
                localStorage.setItem('auth_token', token)
              }

              // 導回 redirect 或首頁
              const redirect = (router.currentRoute.value.query.redirect as string) || null
              if (redirect) {
                await router.replace(redirect)
              } else {
                await router.replace({ name: 'Home' })
              }
            } catch (e: unknown) {
              const err = e as unknown
              error.value = (err as Error)?.message || 'Google 登入處理失敗'
              console.error('google callback error', err)
            }
          },
        })

        // 顯示一鍵登入提示（或彈窗）
        promptFn?.()
      } catch (e: unknown) {
        const err = e as unknown
        error.value = (err as Error)?.message || '載入 Google 登入套件失敗'
      }
    }

    // 如果後端在重導到 /login 時帶上 token，這邊會接收並儲存
    onMounted(() => {
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
