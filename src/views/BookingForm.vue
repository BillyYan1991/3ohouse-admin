<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">No.{{ booking.orderNo }}</h1>

    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <form>
        <div class="mb-3">
          <label class="form-label">民宿</label>
          <input class="form-control" :value="booking.house.name" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">姓名</label>
          <input class="form-control" :value="booking.userName" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">入住日期</label>
          <!--sub 0~10-->
          <input type="date" class="form-control" :value="formatDate(booking?.checkIn)" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">退房日期</label>
          <input type="date" class="form-control" :value="formatDate(booking.checkOut)" readonly />
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
          <input type="number" class="form-control" style="background-color:beige;" :value="booking.prepayment"
            readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">已付金額</label>
          <input type="number" class="form-control" style="background-color:beige;" v-model="booking.paid" />
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
                    <td class="cell">{{ detail.extraBedQty }}</td>
                    <td class="cell">{{ detail.extraBedPrice }}</td>
                    <td class="cell">{{ detail.babyBedQty }}</td>

                  </tr>

                </tbody>
              </table>
            </div><!--//table-responsive-->

          </div><!--//app-card-body-->
        </div>
        <button class="btn btn-primary ms-2" type="submit" @click.prevent="onSave">儲存</button>
        <button class="btn bg-danger ms-2" type="submit" @click.prevent="onCancel">取消</button>
        <button class="btn btn-secondary ms-2" type="button" @click="goBack">返回</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import type { Booking } from '@/types/booking'

const apiUrl = import.meta.env.VITE_API_URL
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



    const fetchBooking = async (bookingId: string) => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get<Booking>(`${apiUrl}/booking/form?id=${bookingId}`)
        booking.value = res.data
        console.log('載入的 booking 資料', booking.value)
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

    const onSave = async () => {
      // 範例：如果有 id，put 更新，否則 post 建立
      try {
        if (id) {
          const payload = {
            id: booking.value?.id,
            prepayment: booking.value?.prepayment ?? 0,
            paid: booking.value?.paid ?? 0,
            status: 2
          }
          await axios.put(`${apiUrl}/booking/form?id=${id}`, payload)
        } else {
          //尚未實作後台新增
          // await axios.post(`${apiUrl}/booking/form`, booking.value)
        }
        router.back()
      } catch (err: unknown) {
        error.value = getErrorMessage(err) || '儲存失敗'
      }
    }

    const onCancel = async () => {
      // 範例：如果有 id，put 更新，否則 post 建立
      try {
        if (id) {
          const payload = {
            id: booking.value?.id,
            prepayment: booking.value?.prepayment ?? 0,
            paid: booking.value?.paid ?? 0,
            status: -1
          }
          await axios.put(`${apiUrl}/booking/form?id=${id}`, payload)
        } else {
          //尚未實作後台新增
          // await axios.post(`${apiUrl}/booking/form`, booking.value)
        }
        router.back()
      } catch (err: unknown) {
        error.value = getErrorMessage(err) || '儲存失敗'
      }
    }

    const goBack = () => router.back()

    return { loading, error, booking, onSave, goBack, onCancel, formatDate }
  }
})
</script>

<style scoped>
/* placeholder */
</style>
