<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">{{ houseName }} - 房型列表</h1>
    <div class="tab-pane fade active show" id="orders-all" role="tabpanel" aria-labelledby="orders-all-tab">
      <div class="app-card app-card-orders-table shadow-sm mb-5">
        <div class="app-card-body">
          <div class="table-responsive">
            <table class="table app-table-hover mb-0 text-left">
              <thead>
                <tr>
                  <th class="cell">房型</th>
                  <th class="cell"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in rooms" :key="room.id">
                  <td class="cell">{{ room.name }}</td>
                  <td class="cell"><router-link class="btn app-btn-primary"
                      :to="{ name: 'RoomForm', params: { id: room.id } }">編輯</router-link></td>
                </tr>

              </tbody>
            </table>
          </div><!--//table-responsive-->

        </div><!--//app-card-body-->
      </div><!--//app-card-->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue'
import type { Room } from '@/types/room'
import { useRoute } from 'vue-router'

import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

//format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('zh-TW', options)
}

export default defineComponent({
  name: 'RoomList',
  setup() {
    const rooms = ref<Room[]>([])
    const route = useRoute()
    const houseId = computed(() => String(route.params.id ?? ''))
    const houseName = computed(() => {
      if (houseId.value === '1') {
        return '無憂'
      } else if (houseId.value === '2') {
        return '寄寓'
      } else if (houseId.value === '3') {
        return '上水'
      } else if (houseId.value === '4') {
        return '花水木'
      } else if (houseId.value === '5') {
        return '避風港'
      }
      return ''
    })
    const fetchRooms = async () => {
      try {
        const res = await axios.get<Room[]>(`${apiUrl}/booking/rooms?houseId=${houseId.value}`)
        rooms.value = res.data || []
      } catch (err) {
        console.error('無法取得房型資料', err)
      }
    }

    onMounted(fetchRooms)

    watch(houseId, () => {
      fetchRooms()
    })

    return { rooms, formatDate, houseName }
  }
})
</script>

<style scoped>
/* simple placeholder */
</style>
