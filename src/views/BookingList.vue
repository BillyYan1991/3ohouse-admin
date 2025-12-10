<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">列表</h1>
    <div class="tab-pane fade active show" id="orders-all" role="tabpanel" aria-labelledby="orders-all-tab">
      <div class="app-card app-card-orders-table shadow-sm mb-5">
        <div class="app-card-body">
          <div class="table-responsive">
            <table class="table app-table-hover mb-0 text-left">
              <thead>
                <tr>
                  <th class="cell">名稱</th>
                  <th class="cell">房型</th>
                  <th class="cell">客戶名稱</th>
                  <th class="cell">入住日期</th>
                  <th class="cell">退房日期</th>
                  <th class="cell">幾晚</th>
                  <th class="cell">金額</th>
                  <th class="cell">末五碼</th>
                  <th class="cell">狀態</th>
                  <th class="cell"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookings" :key="booking.id">
                  <td class="cell">{{ booking.house.name }}</td>
                  <td class="cell"><span class="truncate">{{ roomNames(booking.details) }}</span></td>
                  <td class="cell">{{ booking.userName }}</td>
                  <td class="cell"><span class="cell-data">{{ formatDate(booking.checkIn) }}</span></td>
                  <td class="cell"><span class="cell-data">{{ formatDate(booking.checkOut) }}</span></td>
                  <td class="cell">{{ booking.nights }}</td>
                  <td class="cell">{{ booking.totalPrice }}</td>
                  <td class="cell">{{ booking.paymemo }}</td>
                  <td class="cell">
                    <span v-if="booking.status === 1">待處理</span>
                    <span v-else-if="booking.status === 2">已確認</span>
                    <span v-else-if="booking.status === -1">已取消</span>
                  </td>
                  <td class="cell"><router-link class="btn app-btn-primary" v-if="booking.status !== -1"
                      :to="{ name: 'BookingForm', params: { id: booking.id } }">編輯</router-link></td>
                </tr>

              </tbody>
            </table>
          </div><!--//table-responsive-->

        </div><!--//app-card-body-->
      </div><!--//app-card-->
      <nav class="app-pagination" style="display: none;">
        <ul class="pagination justify-content-center">
          <li class="page-item disabled">
            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
          </li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
          <li class="page-item">
            <a class="page-link" href="#">Next</a>
          </li>
        </ul>
      </nav><!--//app-pagination-->

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import type { Booking } from '@/types/booking'

import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

//format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('zh-TW', options)
}

export default defineComponent({
  name: 'BookingList',
  setup() {
    const bookings = ref<Booking[]>([])
    onMounted(async () => {
      try {
        const res = await axios.get<Booking[]>(`${apiUrl}/booking/list`)
        bookings.value = res.data || []
        console.log('未處裡訂房資料', bookings.value)
      } catch (err) {

        console.error('無法取得未處裡訂房資料', err)
      }
    })

    const roomNames = (details: import('@/types/booking').BookingDetail[] | undefined) => {
      if (!details || !details.length) return ''
      try {
        return details.map(d => d.room?.name).filter(Boolean).join(' / ')
      } catch {
        return ''
      }
    }

    return { bookings, formatDate, roomNames }
  }
})
</script>

<style scoped>
/* simple placeholder */
</style>
