<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">特別價格</h1>
    <div class="tab-pane fade active show" id="orders-all" role="tabpanel" aria-labelledby="orders-all-tab">
      <div class="app-card app-card-orders-table shadow-sm mb-5">
        <div class="app-card-body">
          <div class="table-responsive">
            <table class="table app-table-hover mb-0 text-left">
              <thead>
                <tr>
                  <th class="cell">名稱</th>
                  <th class="cell">房型</th>
                  <th class="cell">變價</th>
                  <th class="cell">起始日期</th>
                  <th class="cell">結束日期</th>
                  <th class="cell">啟用</th>
                  <th class="cell"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="obj in list" :key="obj.id">
                  <td class="cell">{{ obj.name }}</td>
                  <td class="cell">{{ obj.roomName }}</td>
                  <td class="cell">{{ obj.price }}</td>
                  <td class="cell"><span class="cell-data">{{ formatDate(obj.startDate) }}</span></td>
                  <td class="cell"><span class="cell-data">{{ formatDate(obj.endDate) }}</span></td>
                  <td class="cell">{{ obj.isActive }}</td>
                  <td class="cell"><router-link class="btn app-btn-primary"
                      :to="{ name: 'SpecialDayForm', params: { id: obj.id } }">edit</router-link></td>
                </tr>

              </tbody>
            </table>
          </div><!--//table-responsive-->

        </div><!--//app-card-body-->
      </div><!--//app-card-->
      <nav class="app-pagination">
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
import { useRoute, } from 'vue-router'
import type { roomSpecialDay } from '@/types/roomSpecialDay'

import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL
//format date
const formatDate = (dateString: Date) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(dateString).toLocaleDateString('zh-TW', options)
}


export default defineComponent({
  name: 'SpecialDayList',
  setup() {
    const list = ref<roomSpecialDay[]>([])
    const route = useRoute()
    console.log('route params', route.params)
    const houseId = route.params.id as string | undefined
    onMounted(async () => {
      try {
        const res = await axios.get<roomSpecialDay[]>(`${apiUrl}/specialday/list?houseId=${houseId}`)
        list.value = res.data || []
        console.log('房型資料', list.value)

      } catch (err) {
        list.value = []
        console.error('無法載入房型資料', err)
      }
    })



    return { list, formatDate }
  }
})
</script>

<style scoped>
/* simple placeholder */
</style>
