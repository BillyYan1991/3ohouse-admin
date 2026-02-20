<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">訂單管理</h1>
    <div class="row mb-3 align-items-center">
      <form @submit.prevent="onSearch" class="w-100">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <input v-model="q" type="text" id="searchInput" class="form-control" placeholder="姓名、電話、信箱">
          </div>
          <div class="col-md-3">
            <label for="houseIdInput" class="form-label">房源</label>
            <select v-model="houseId" id="houseIdInput" class="form-select">
              <option value="">全部房源</option>
              <option value="1">無憂</option>
              <option value="2">寄寓</option>
              <option value="3">上水</option>
              <option value="4">花水木</option>
              <option value="5">避風港</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="statusSelect" class="form-label">狀態</label>
            <select v-model="status" id="statusSelect" class="form-select">
              <option value="">全部狀態</option>
              <option value="1">待處理</option>
              <option value="2">已確認</option>
              <option value="-1">已取消</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" type="submit">搜尋</button>
          </div>
        </div>
      </form>
    </div>
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
                  <td class="cell"><span class="truncate">{{ booking.house.name }}</span></td>
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
                  <td class="cell">
                    <router-link v-if="booking.status !== -1" class="btn app-btn-primary"
                      :to="{ name: 'BookingForm', params: { id: booking.id } }">
                      編輯
                    </router-link>
                    <router-link v-if="booking.status === -1" class="btn btn-secondary"
                      :to="{ name: 'BookingForm', params: { id: booking.id } }">
                      預覽
                    </router-link>
                  </td>
                </tr>

              </tbody>
            </table>
          </div><!--//table-responsive-->

        </div><!--//app-card-body-->
      </div><!--//app-card-->
      <nav class="app-pagination">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: page <= 1 }">
            <a class="page-link" href="#" @click.prevent="prevPage">上一頁</a>
          </li>
          <li v-for="p in pages" :key="p" class="page-item" :class="{ active: page === p }">
            <a class="page-link" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
          </li>
          <li class="page-item" :class="{ disabled: page >= totalPages }">
            <a class="page-link" href="#" @click.prevent="nextPage">下一頁</a>
          </li>
        </ul>
      </nav><!--//app-pagination-->

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue'
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
    const page = ref<number>(1)
    const pageSize = ref<number>(10)
    const totalPages = ref<number>(1)
    const total = ref<number>(0)
    const loading = ref<boolean>(false)

    const fetchBookings = async (p: number = page.value) => {
      loading.value = true
      try {
        const params: any = { page: p, pageSize: pageSize.value }
        if (q.value) params.q = q.value
        if (houseId.value) params.houseId = houseId.value
        if (status.value !== '') params.status = status.value
        const res = await axios.get(`${apiUrl}/booking/list`, { params })
        const d = res.data || {}
        bookings.value = d.data || []
        total.value = d.total || 0
        totalPages.value = d.totalPages || 1
        page.value = d.page || p
        console.log('取得分頁訂房資料', { page: page.value, pageSize: pageSize.value, total: total.value })
      } catch (err) {
        console.error('無法取得訂房資料', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      void fetchBookings()
    })

    const roomNames = (details: import('@/types/booking').BookingDetail[] | undefined) => {
      if (!details || !details.length) return ''
      try {
        return details.map(d => d.room?.name).filter(Boolean).join(' / ')
      } catch {
        return ''
      }
    }

    const pages = computed(() => {
      const arr: number[] = []
      for (let i = 1; i <= Math.max(1, totalPages.value); i++) arr.push(i)
      return arr
    })

    const q = ref<string>('')
    const houseId = ref<string>('')
    const status = ref<string | number>('')

    const onSearch = () => {
      void fetchBookings(1)
    }

    const goToPage = (p: number) => {
      if (p < 1 || p > Math.max(1, totalPages.value)) return
      void fetchBookings(p)
    }

    const prevPage = () => {
      if (page.value <= 1) return
      void fetchBookings(page.value - 1)
    }

    const nextPage = () => {
      if (page.value >= Math.max(1, totalPages.value)) return
      void fetchBookings(page.value + 1)
    }

    return { bookings, formatDate, roomNames, page, pageSize, totalPages, total, pages, goToPage, prevPage, nextPage, loading, onSearch, q, houseId, status }
  }
})
</script>

<style scoped>
.truncate {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
