<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title" v-if="houseId == '1'">無憂特別價格</h1>
    <h1 class="app-page-title" v-if="houseId == '2'">寄寓特別價格</h1>
    <h1 class="app-page-title" v-if="houseId == '3'">上水特別價格</h1>
    <h1 class="app-page-title" v-if="houseId == '4'">花水木特別價格</h1>

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
          <input type="date" class="form-control" v-model="special.startDate" :min="minDate" />
          <!--sub 0~10-->
        </div>
        <div class="mb-3">
          <label class="form-label">結束日期</label>
          <input type="date" class="form-control" v-model="special.endDate" :min="minDate" />
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
          <textarea class="form-control" rows="3" v-model="special.memo"></textarea>
        </div>
        <div class="app-card app-card-orders-table shadow-sm mb-5">
          <div class="app-card-body">
            <div class="table-responsive">
              <table class="table app-table-hover mb-0 text-left">
                <thead>
                  <tr>
                    <th style="background-color:azure" class=" cell">房型</th>
                    <th style="background-color:azure" class="cell">變額</th>
                    <th style="background-color:azure" class="cell">關房</th>
                    <th style="background-color:azure" class="cell"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(obj, idx) in list" :key="obj.id">
                    <td class="cell">{{ obj.name }}</td>
                    <td class="cell">
                      <input type="hidden" class="form-control" v-model.number="list[idx].id" />
                      <input type="number" class="form-control" v-model.number="list[idx].price" />
                    </td>
                    <td class="cell">
                      <input type="checkbox" class="form-check-input" v-model.number="list[idx].isClosed" />
                    </td>
                    <td class="cell">
                      <button class="btn btn-danger" @click.prevent="removeRow(idx)">刪除</button>
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
  name: string
  price: number
  isClosed: boolean
}
const special = ref({
  name: '',
  startDate: '',
  endDate: '',
  isActiveString: 'true', // 用字串綁定 radio，儲存時轉成 boolean
  memo: ''
})

export default defineComponent({
  name: 'SpecialDayNewForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const id = route.params.id as string
    const houseId = ref(id)

    const loading = ref(false)
    const error = ref<string | null>(null)
    const minDate = formatDateToInput(new Date().toISOString())
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
        const res = await axios.get<RoomRow[]>(`${apiUrl}/specialday/newform?houseId=${houseId}`)
        list.value = res.data || []
        //price 初始值設 0
        list.value.forEach(item => {
          item.price = 0
        })
        console.log('載入的 room 資料', list.value)
      } catch (err: unknown) {
        error.value = getErrorMessage(err)
      } finally {
        loading.value = false
      }
    }

    if (id) {
      fetchRoom(id)
    }

    const onSave = async () => {
      // client-side validation: start/end dates must not be before today
      error.value = null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const s = special.value.startDate ? new Date(special.value.startDate) : null
      const e = special.value.endDate ? new Date(special.value.endDate) : null
      if (!s || isNaN(s.getTime())) { error.value = '請輸入有效的起始日期'; return }
      s.setHours(0, 0, 0, 0)
      if (s < today) { error.value = '起始日期不可小於今天'; return }
      if (!e || isNaN(e.getTime())) { error.value = '請輸入有效的結束日期'; return }
      e.setHours(0, 0, 0, 0)
      if (e < s) { error.value = '結束日期不可小於起始日期'; return }
      loading.value = true
      try {
        //payload[]
        const payload = list.value.map(item => ({
          houseId: Number(id),
          roomId: item.id,
          name: special.value.name,
          startDate: new Date(special.value.startDate),
          endDate: new Date(special.value.endDate),
          isActive: special.value.isActiveString === 'true',
          memo: special.value.memo || null,
          price: item.price,
          isClosed: item.isClosed
        }))


        //status
        const res = await axios.post(`${apiUrl}/specialday/form`, payload)
        console.log('儲存回應', res)
        if (res.status !== 200) {
          throw new Error('日期區間重複')
        } else {
          //清除物件
          special.value = {
            name: '',
            startDate: '',
            endDate: '',
            isActiveString: 'true',
            memo: ''
          }
          router.back()
        }

      } catch (err: unknown) {
        error.value = getErrorMessage(err) || '儲存失敗'
      } finally {
        loading.value = false
      }
    }


    const goBack = () => router.back()
    const removeRow = (idx: number) => {
      list.value.splice(idx, 1)
    }

    return { loading, error, list, special, onSave, goBack, removeRow, formatDate, formatDateToInput, houseId, minDate }
  }
})

</script>

<style scoped>
/* placeholder */
</style>
