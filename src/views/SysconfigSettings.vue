<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">系統參數設定</h1>
    <p>新增項目記得加上li標籤</p>
    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <form>
        <div class="mb-3">
          <label class="form-label fs-5 fw-bold">入住須知</label>
          <textarea class="form-control" v-model="notice.param1" rows="6" style="height: 300px;"></textarea>
        </div>
        <div>
          <button class="btn btn-primary me-3" type="submit" @click.prevent="onSaveNotice()" :disabled="saving">
            儲存
          </button>
        </div>
      </form>
      <hr class="my-4">
      <form>
        <div class="mb-3">
          <label class="form-label fs-5 fw-bold">取消政策</label>
          <textarea class="form-control" v-model="cancelPolicy.param1" rows="6" style="height: 300px;"></textarea>
        </div>
        <div class="d-flex align-items-center">
          <!-- 左邊按鈕群 -->
          <div>
            <button class="btn btn-primary me-3" type="submit" @click.prevent="onSaveCancelPolicy()" :disabled="saving">
              儲存
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import type { SysConfig } from '@/types/sysconfig'
import { getToken, parseJwt } from '@/utils/auth'

const apiUrl = import.meta.env.VITE_API_URL

export default defineComponent({
  name: 'SysconfigSettings',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const loading = ref(false)
    const error = ref<string | null>(null)
    const notice = ref<Partial<SysConfig>>({})
    const cancelPolicy = ref<Partial<SysConfig>>({})


    // 防連點 flags
    const saving = ref(false)
    const navigating = ref(false)
    const savedNoticeMessage = ref<string>('')
    const savedCancelMessage = ref<string>('')

    const getErrorMessage = (err: unknown) => {
      if (!err) return '發生錯誤'
      if (typeof err === 'string') return err
      try {
        const rec = err as Record<string, unknown>
        const resp = rec?.response as Record<string, unknown> | undefined
        const data = resp?.data as Record<string, unknown> | undefined
        return (data && (data.message as string)) || (rec.message as string) || '發生錯誤'
      } catch {
        return '發生錯誤'
      }
    }

    const readStoredUser = (): string | null => {
      try {
        const raw = localStorage.getItem('auth_user')
        if (!raw) return null
        try {
          const parsed = JSON.parse(raw)
          if (!parsed) return null
          return (parsed.name as string) || (parsed.email as string) || (parsed.user as string) || JSON.stringify(parsed)
        } catch {
          return raw
        }
      } catch {
        return null
      }
    }

    const displayUser = computed(() => {
      const stored = readStoredUser()
      if (stored) return stored
      const t = getToken()
      if (!t) return ''
      const payload = parseJwt(t)
      if (!payload) return ''
      const name = (payload as Record<string, any>)['name'] || (payload as Record<string, any>)['email'] || (payload as Record<string, any>)['sub'] || (payload as Record<string, any>)['user']
      return name ? String(name) : ''
    })



    const fetchNotice = async () => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get<SysConfig>(`${apiUrl}/sysconfig/getById?id=1`)
        notice.value = res.data

        console.log('載入的 notice 資料', notice.value)

      } catch (err: unknown) {
        error.value = getErrorMessage(err)
      } finally {
        loading.value = false
      }
    }
    const fetchCancelPolicy = async () => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get<SysConfig>(`${apiUrl}/sysconfig/getById?id=2`)
        cancelPolicy.value = res.data

        console.log('載入的 cancelPolicy 資料', cancelPolicy.value)

      } catch (err: unknown) {
        error.value = getErrorMessage(err)
      } finally {
        loading.value = false
      }
    }


    fetchNotice()
    fetchCancelPolicy()


    const onSaveNotice = async () => {
      if (saving.value) return
      saving.value = true
      error.value = null
      loading.value = true
      try {
        const payload = {
          id: 1,
          param1: notice.value.param1
        }
        await axios.put(`${apiUrl}/sysconfig/update?id=1`, payload)
        // 顯示儲存成功訊息（不要跳頁，永久顯示）
        savedNoticeMessage.value = '儲存成功'
      } catch (err: unknown) {
        console.error('onSave error', err)
        try {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status
            const data = err.response?.data
            error.value = getErrorMessage(err) || `儲存失敗 (${status})`
            window.alert(`伺服器錯誤: ${status}\n${JSON.stringify(data)}`)
          } else {
            error.value = getErrorMessage(err) || '儲存失敗'
          }
        } catch {
          error.value = '儲存失敗'
        }
      } finally {
        saving.value = false
        loading.value = false
      }
    }

    const onSaveCancelPolicy = async () => {
      if (saving.value) return
      saving.value = true
      error.value = null
      loading.value = true
      try {
        const payload = {
          id: 2,
          param1: cancelPolicy.value.param1
        }
        await axios.put(`${apiUrl}/sysconfig/update?id=2`, payload)
        // 顯示儲存成功訊息（不要跳頁，永久顯示）
        savedCancelMessage.value = '儲存成功'
      } catch (err: unknown) {
        console.error('onSave error', err)
        try {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status
            const data = err.response?.data
            error.value = getErrorMessage(err) || `儲存失敗 (${status})`
            window.alert(`伺服器錯誤: ${status}\n${JSON.stringify(data)}`)
          } else {
            error.value = getErrorMessage(err) || '儲存失敗'
          }
        } catch {
          error.value = '儲存失敗'
        }
      } finally {
        saving.value = false
        loading.value = false
      }
    }



    const goBack = async () => {
      if (navigating.value) return
      navigating.value = true

      try {
        // 新開視窗/分頁常見 history 長度不足，back 會無效
        if (window.history.length > 1) {
          router.back()
          // 若 back 無效，避免按鈕永久 disabled
          setTimeout(() => {
            navigating.value = false
          }, 500)
          return
        }

        // fallback：沒有可返回歷史時，導到預設頁
        const fgparam = route.query.fg as string | undefined
        if (fgparam === '1') {
          await router.replace('/index')
        } else {
          await router.replace('/index') // 也可改成你要的列表頁，例如 '/booking'
        }
      } catch {
        navigating.value = false
      }
    }

    return { loading, error, onSaveNotice, onSaveCancelPolicy, goBack, saving, navigating, displayUser, notice, cancelPolicy, savedNoticeMessage, savedCancelMessage }
  }
})
</script>

<style scoped>
/* placeholder */
</style>
