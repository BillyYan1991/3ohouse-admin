<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title" v-if="houseId == '1'">無憂特別價格</h1>
    <h1 class="app-page-title" v-if="houseId == '2'">寄寓特別價格</h1>
    <h1 class="app-page-title" v-if="houseId == '3'">上水特別價格</h1>
    <h1 class="app-page-title" v-if="houseId == '4'">花水木特別價格</h1>
    <div class="mb-3">
      <button class="btn app-btn-primary" @click="goNew" :aria-disabled="navigatingNew"
        :class="{ disabled: navigatingNew }">新增特別價格</button>
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
                  <th class="cell">調整金額</th>
                  <th class="cell">起始日期</th>
                  <th class="cell">結束日期</th>
                  <th class="cell">單賣</th>
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
                  <td class="cell">{{ obj.isMain ? '是' : '否' }}</td>
                  <td class="cell">{{ obj.isActive ? '是' : '否' }}</td>
                  <td class="cell"><a class="btn app-btn-primary" href="#" @click.prevent="goEdit(obj.id)"
                      :aria-disabled="navigatingMap[obj.id]" :class="{ disabled: navigatingMap[obj.id] }">編輯</a></td>
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
import { defineComponent, onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
    const router = useRouter()
    // reactive houseId computed from route params so template and logic update on param change
    const houseId = computed(() => String(route.params.id ?? ''))



    // load function reused by onMounted and watcher
    async function loadList(id: string) {
      try {
        const res = await axios.get<roomSpecialDay[]>(`${apiUrl}/specialday/list?houseId=${encodeURIComponent(id)}`)
        list.value = res.data || []
        console.log('房型資料', list.value)
      } catch (err) {
        list.value = []
        console.error('無法載入房型資料', err)
      }
    }

    onMounted(() => {
      loadList(houseId.value)
    })

    // re-load when route param changes (router may reuse component instance)
    watch(() => route.params.id, (newId, oldId) => {
      const id = String(newId ?? '')
      if (id && id !== String(oldId ?? '')) {
        loadList(id)
      }
    })

    // 防連點: 新增/編輯導航
    const navigatingNew = ref(false)
    const navigatingMap = ref<Record<string | number, boolean>>({})

    function goNew() {
      if (navigatingNew.value) return
      navigatingNew.value = true
      router.push({ name: 'SpecialDayNewForm', params: { id: houseId.value } })
    }

    function goEdit(id: string | number) {
      if (navigatingMap.value[String(id)]) return
      navigatingMap.value[String(id)] = true
      router.push({ name: 'SpecialDayForm', params: { id } })
    }



    return { list, formatDate, houseId, goNew, goEdit, navigatingNew, navigatingMap }
  }
})
</script>

<style scoped>
/* simple placeholder */
</style>
