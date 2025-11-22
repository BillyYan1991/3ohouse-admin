<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">特別價格</h1>

    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <form @submit.prevent="onSave">
        <div class="mb-3">
          <label class="form-label">名稱</label>
          <input class="form-control" v-model="special.name" />
        </div>
        <div class="mb-3">
          <label class="form-label">起始日期</label>
          <input type="date" class="form-control" v-model="special.startDate" />
          <!--sub 0~10-->
        </div>
        <div class="mb-3">
          <label class="form-label">結束日期</label>
          <input type="date" class="form-control" v-model="special.endDate" />
        </div>
        <div class="mb-3">
          <label class="form-label d-block">啟用</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="activeTrue" value="true"
              v-model="special.isActiveString" />
            <label class="form-check-label" for="activeTrue">是</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="activeFalse" value="false"
              v-model="special.isActiveString" />
            <label class="form-check-label" for="activeFalse">否</label>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">備註</label>
          <textarea class="form-control" rows="3" v-model="special.memo" readonly></textarea>
        </div>
        <div class="app-card app-card-orders-table shadow-sm mb-5">
          <div class="app-card-body">
            <div class="table-responsive">
              <table class="table app-table-hover mb-0 text-left">
                <thead>
                  <tr>
                    <th style="background-color:azure" class=" cell">房型</th>
                    <th style="background-color:azure" class="cell">變額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(obj, idx) in list" :key="obj.id">
                    <td class="cell">{{ obj.roomName }}</td>
                    <td class="cell">
                      <input type="number" class="form-control" v-model.number="list[idx].price" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div><!--//table-responsive-->
          </div><!--//app-card-body-->
        </div>
        <button class="btn btn-primary ms-2" type="submit" @click.prevent="onSave">儲存</button>
        <button class="btn btn-secondary ms-2" type="button" @click="goBack">返回</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

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
interface RoomRow {
  id: number
  houseId: number
  roomId: number
  roomName: string
  price: number
}
const special = ref({
  name: '',
  startDate: '',
  endDate: '',
  isActiveString: 'true', // 用字串綁定 radio，儲存時轉成 boolean
  memo: ''
})

export default defineComponent({
  name: 'SpecialDayForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    // id undefined = 0
    const id = route.query.id as string | undefined
    console.log('route query id', id)
    const houseId = route.params.houseId as string | undefined

    const loading = ref(false)
    const error = ref<string | null>(null)
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


    const list = ref<RoomRow[]>([])
    const fetchRoom = async (houseId: string) => {

      loading.value = true
      error.value = null
      try {
        const res = await axios.get<RoomRow[]>(`${apiUrl}/specialday/form?id=${id}&houseId=${houseId}`)
        list.value = res.data || []
        console.log('載入的 room 資料', list.value)
      } catch (err: unknown) {
        error.value = getErrorMessage(err)
      } finally {
        loading.value = false
      }
    }

    if (houseId) {
      fetchRoom(houseId)
    }

    const onSave = async () => {
      loading.value = true
      error.value = null
      try {
        const payload = {
          id: id ? id : undefined,
          houseId: houseId ? Number(houseId) : undefined,
          name: special.value.name,
          startDate: special.value.startDate ? special.value.startDate.slice(0, 10) : null,
          endDate: special.value.endDate ? special.value.endDate.slice(0, 10) : null,
          isActive: special.value.isActiveString === 'true',
          memo: special.value.memo || null,
          details: list.value.map(item => ({
            roomId: item.id,
            price: Number(item.price ?? 0)
          }))
        }

        if (id) {
          await axios.put(`${apiUrl}/specialday/form?id=${id}`, payload)
        } else {
          await axios.post(`${apiUrl}/specialday/form`, payload)
        }
        router.back()
      } catch (err: unknown) {
        error.value = getErrorMessage(err) || '儲存失敗'
      } finally {
        loading.value = false
      }
    }



    const goBack = () => router.back()

    return { loading, error, list, special, onSave, goBack, formatDate, formatDateToInput }
  }
})
</script>

<style scoped>
/* placeholder */
</style>
