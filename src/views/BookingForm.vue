<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">No.{{ booking.orderNo }}</h1>

    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <form>
        <div class="mb-3">
          <label class="form-label">民宿</label>
          <input class="form-control" :value="booking.house?.name" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">姓名</label>
          <input class="form-control" :value="booking.userName" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">入住日期</label>
          <!--sub 0~10-->
          <input type="date" class="form-control" style="background-color:beige;" v-model="booking.checkIn" />
        </div>
        <div class="mb-3">
          <label class="form-label">退房日期</label>
          <input type="date" class="form-control" style="background-color:beige;" v-model="booking.checkOut" />
        </div>
        <div class="mb-3">
          <label class="form-label">幾晚</label>
          <input type="number" class="form-control" :value="booking.nights" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">總金額</label>
          <input type="number" class="form-control" :value="booking.totalPrice" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">訂金</label>
          <input type="number" class="form-control" :value="booking.prepayment" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">調整金額</label>
          <input type="number" class="form-control" style="background-color:beige;" v-model="booking.adjustment" />
        </div>
        <div class="mb-3">
          <label class="form-label">已付金額</label>
          <input type="number" class="form-control" style="background-color:beige;" v-model="booking.paid" />
        </div>
        <div class="mb-3">
          <label class="form-label">電話</label>
          <input type="number" class="form-control" :value="booking.phone" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">email</label>
          <input type="email" class="form-control" :value="booking.email" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">末五碼</label>
          <input type="number" class="form-control" :value="booking.paymemo" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">客戶備註</label>
          <textarea class="form-control" :value="booking.memo" rows="3" readonly></textarea>
        </div>
        <div class="app-card app-card-orders-table shadow-sm mb-5">
          <div class="app-card-body">
            <div class="table-responsive">
              <table class="table app-table-hover mb-0 text-left">
                <thead>
                  <tr>
                    <th style="background-color:azure" class=" cell">房型</th>
                    <th style="background-color:azure" class="cell">金額</th>
                    <th style="background-color:azure" class="cell">加床</th>
                    <th style="background-color:azure" class="cell">加床價格</th>
                    <th style="background-color:azure" class="cell">嬰兒床</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detail in booking.details" :key="detail.id">
                    <td class="cell">{{ detail.room.name }}</td>
                    <td class="cell">{{ detail.price }}</td>
                    <td class="cell">
                      <select class="form-select" v-model.number="detail.extraBedQty"
                        @change="onExtraBedQtyChange(detail)">
                        <option v-for="n in (detail.room?.extraBedQty ?? 0) + 1" :key="n - 1" :value="n - 1">{{ n - 1 }}
                        </option>
                      </select>
                    </td>
                    <td class="cell">{{ detail.extraBedPrice }}</td>
                    <td class="cell">
                      <select class="form-select" v-model.number="detail.babyBedQty">
                        <option :value="0">0</option>
                        <option :value="1">1</option>
                      </select>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div><!--//table-responsive-->
          </div><!--//app-card-body-->
        </div>
        <div class="mb-3">
          <label class="form-label">管理員備註</label>
          <textarea class="form-control" v-model="booking.admin_memo" rows="3"></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">最後更新人員</label>
          <input class="form-control" :value="booking.lastUpdateUser" readonly />
        </div>
        <div class="d-flex align-items-center">
          <!-- 左邊按鈕群 -->
          <div>
            <button class="btn btn-primary ms-2" type="submit" @click.prevent="onSave(false)" :disabled="saving">
              儲存
            </button>
            <button class="btn btn-primary ms-2" type="submit" @click.prevent="onSave(true)" :disabled="saving">
              儲存並發送信件
            </button>
            <button class="btn btn-secondary ms-2" type="button" @click="goBack" :disabled="navigating">
              返回
            </button>
          </div>

          <!-- 右邊取消訂單 -->
          <div class="ms-auto">
            <button class="btn bg-danger ms-2" type="submit" @click.prevent="onCancel" :disabled="cancelling">
              取消訂單
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
import type { Booking } from '@/types/booking'
import { getToken, parseJwt } from '@/utils/auth'

const apiUrl = import.meta.env.VITE_API_URL
// input[type=date] 專用
const formatDateToInput = (dateString: string) => {
  const d = new Date(dateString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
//format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('zh-TW', options)
}
export default defineComponent({
  name: 'BookingForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const id = route.params.id as string | undefined

    const loading = ref(false)
    const error = ref<string | null>(null)
    const booking = ref<Partial<Booking>>({})
    const originalCheckIn = ref<string | null>(null)
    const originalCheckOut = ref<string | null>(null)

    // 防連點 flags
    const saving = ref(false)
    const cancelling = ref(false)
    const navigating = ref(false)

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



    const fetchBooking = async (bookingId: string) => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get<Booking>(`${apiUrl}/booking/form?id=${bookingId}`)
        booking.value = res.data
        // 正規化後端回傳的日期（可能含 time）為 YYYY-MM-DD，讓 input[type=date] 的 v-model 能正確顯示
        try {
          if (booking.value?.checkIn) booking.value.checkIn = formatDateToInput(String(booking.value.checkIn))
          if (booking.value?.checkOut) booking.value.checkOut = formatDateToInput(String(booking.value.checkOut))
        } catch {
          // ignore
        }
        console.log('載入的 booking 資料', booking.value)
        originalCheckIn.value = booking.value?.checkIn ? String(booking.value.checkIn) : null
        originalCheckOut.value = booking.value?.checkOut ? String(booking.value.checkOut) : null
      } catch (err: unknown) {
        error.value = getErrorMessage(err)
      } finally {
        loading.value = false
      }
    }

    if (id) {
      // 如果有 id，載入該 booking
      fetchBooking(id)
    }

    const onSave = async (sendEmail: boolean = false) => {
      if (saving.value) return
      saving.value = true
      // 範例：如果有 id，put 更新，否則 post 建立
      try {
        // 如果 checkIn/checkOut 有變動，先檢查是否與已存在訂單衝突
        const checkInStr = booking.value?.checkIn ? formatDateToInput(booking.value.checkIn as string) : ''
        const checkOutStr = booking.value?.checkOut ? formatDateToInput(booking.value.checkOut as string) : ''
        // 轉為 ISO 格式送給後端（避免格式不一致）
        const isoCheckIn = checkInStr ? new Date(checkInStr).toISOString() : null
        const isoCheckOut = checkOutStr ? new Date(checkOutStr).toISOString() : null
        const datesChanged = checkInStr !== (originalCheckIn.value || '') || checkOutStr !== (originalCheckOut.value || '')
        if (datesChanged) {
          for (const d of (booking.value?.details ?? [])) {
            const roomId = d.room?.id
            if (!roomId) continue
            const response = await axios.get(`${apiUrl}/booking/bookedByOrder`, {
              params: {
                id: booking.value?.id,
                roomId: roomId,
                checkIn: checkInStr,
                checkOut: checkOutStr,
              },
            })
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              window.alert(`房型 ${d.room?.name || roomId} 在 ${checkInStr} - ${checkOutStr} 已有重複訂房區間，請確認。`)
              saving.value = false
              return
            }
          }
        }
        if (id) {
          const detailsPayload = (booking.value?.details ?? []).map(d => ({
            id: d.id,
            extraBedQty: d.extraBedQty ?? 0,
            extraBedPrice: d.extraBedPrice ?? 0,
            babyBedQty: d.babyBedQty ?? 0,
            ...(datesChanged ? { checkIn: isoCheckIn, checkOut: isoCheckOut } : {}),
          }))
          const payload = {
            id: booking.value?.id,
            adjustment: booking.value?.adjustment ?? 0,
            paid: booking.value?.paid ?? 0,
            admin_memo: booking.value?.admin_memo ?? null,
            totalPrice: booking.value?.totalPrice ?? 0,
            details: detailsPayload,
            status: 2,
            lastUpdateUser: displayUser.value || 'admin',
            ...(datesChanged ? { checkIn: isoCheckIn, checkOut: isoCheckOut } : {}),
          }
          await axios.put(`${apiUrl}/booking/form?id=${id}&sendMail=${sendEmail}`, payload)
          const fgparam = route.query.fg as string | undefined
          if (fgparam === '1') {
            router.replace('/index')
          } else {
            router.back()
          }
        } else {
          //尚未實作後台新增
          // await axios.post(`${apiUrl}/booking/form`, booking.value)
        }

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
      }
      finally {
        saving.value = false
      }
    }

    const onCancel = async () => {
      if (cancelling.value) return
      const ok = window.confirm('are you sure?really?真假?')
      if (!ok) return
      cancelling.value = true
      // 範例：如果有 id，put 更新，否則 post 建立
      try {
        if (id) {
          const detailsPayload = (booking.value?.details ?? []).map(d => ({
            id: d.id,
            extraBedQty: d.extraBedQty ?? 0,
            extraBedPrice: d.extraBedPrice ?? 0,
            babyBedQty: d.babyBedQty ?? 0,
          }))
          const payload = {
            id: booking.value?.id,
            adjustment: booking.value?.adjustment ?? 0,
            paid: booking.value?.paid ?? 0,
            admin_memo: booking.value?.admin_memo ?? null,
            totalPrice: booking.value?.totalPrice ?? 0,
            details: detailsPayload,
            status: -1,
            lastUpdateUser: displayUser.value || 'admin',
          }
          await axios.put(`${apiUrl}/booking/form?id=${id}`, payload)
        } else {
          //尚未實作後台新增
          // await axios.post(`${apiUrl}/booking/form`, booking.value)
        }
        const fgparam = route.query.fg as string | undefined
        if (fgparam === '1') {
          router.replace('/index')
        } else {
          router.back()
        }
      } catch (err: unknown) {
        error.value = getErrorMessage(err) || '儲存失敗'
      }
      finally {
        cancelling.value = false
      }
    }

    const onExtraBedQtyChange = (detail: Booking['details'][number]) => {
      if (!booking.value) return
      try {
        const oldExtraPrice = Number(detail.extraBedPrice ?? 0)
        const unitPrice = Number(detail.room?.extraBedPrice ?? 0)
        const qty = Number(detail.extraBedQty ?? 0)
        const newExtraPrice = unitPrice * qty
        // update detail extra price
        detail.extraBedPrice = newExtraPrice
        // adjust booking total price: -old + new
        const currentTotal = Number(booking.value.totalPrice ?? 0)
        booking.value.totalPrice = currentTotal - oldExtraPrice + newExtraPrice
      } catch {
        // ignore
      }
    }

    const goBack = () => {
      if (navigating.value) return
      navigating.value = true
      router.back()
      // navigating flag will be irrelevant after navigation
    }

    return { loading, error, booking, onSave, goBack, onCancel, formatDate, formatDateToInput, saving, cancelling, navigating, onExtraBedQtyChange, displayUser, originalCheckIn, originalCheckOut }
  }
})
</script>

<style scoped>
/* placeholder */
</style>
