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
            <input class="form-check-input" type="radio" id="activeTrue" :value="true" v-model="special.isActive" />
            <label class="form-check-label" for="activeTrue">是</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="activeFalse" :value="false" v-model="special.isActive" />
            <label class="form-check-label" for="activeFalse">否</label>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label d-block">單賣</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="uniqueTrue" :value="true" v-model="special.isMain" />
            <label class="form-check-label" for="uniqueTrue">是</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="uniqueFalse" :value="false" v-model="special.isMain"
              checked="true" />
            <label class="form-check-label" for="uniqueFalse">否</label>
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
                    <th style="background-color:azure" class=" cell">原始金額</th>
                    <th style="background-color:azure" class="cell">調整金額</th>
                    <th style="background-color:azure" class="cell">變價</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="cell">{{ special.roomName }}</td>
                    <td class="cell">{{ special.originalPrice }}</td>
                    <td class="cell">
                      <input type="hidden" v-model.number="special.roomId" />
                      <input type="number" class="form-control" v-model.number="special.price" />
                    </td>
                    <td class="cell">{{ special.price + special.originalPrice }}</td>
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
// (formatDateToISO removed; not used)
interface specialday {
  id: number
  name: string
  // store dates as YYYY-MM-DD strings for input[type=date]
  startDate: string
  endDate: string
  isActive: boolean
  memo: string
  houseId: number
  roomId: number
  roomName: string
  originalPrice: number
  price: number
  isMain?: boolean
}


export default defineComponent({
  name: 'SpecialDayForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    // id undefined = 0
    const id = route.params.id as string | undefined

    const loading = ref(false)
    const error = ref<string | null>(null)
    // initialize special so template v-model won't be undefined
    const special = ref<specialday>({
      id: Number(id) || 0,
      name: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      isActive: true,
      memo: '',
      houseId: 0,
      roomId: 0,
      roomName: '',
      originalPrice: 0,
      price: 0
    });
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

    const minDate = formatDateToInput(new Date().toISOString())



    const fetchRoom = async (id: string) => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${apiUrl}/specialday/form?id=${id}`)
        const data = res.data?.data ?? res.data ?? null
        if (data) {
          special.value = {
            id: data.id ?? Number(id) ?? 0,
            name: data.name ?? '',
            startDate: data.startDate ? formatDateToInput(String(data.startDate)) : '',
            endDate: data.endDate ? formatDateToInput(String(data.endDate)) : '',
            isActive: typeof data.isActive === 'boolean' ? data.isActive : (String(data.isActive) === 'true'),
            memo: data.memo ?? '',
            houseId: data.houseId ?? 0,
            roomId: data.roomId ?? 0,
            roomName: data.room.name ?? '',
            originalPrice: data.room.price ?? 0,
            price: data.price ?? 0
          }
        }
        console.log('載入的 specialday 資料', special.value)
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

        const payload = {
          id: special.value?.id,
          name: special.value?.name,
          startDate: new Date(special.value?.startDate),
          endDate: new Date(special.value?.endDate),
          isActive: special.value?.isActive,
          memo: special.value?.memo || null,
          roomId: special.value?.roomId,
          price: special.value?.price,
          isMain: special.value?.isMain || false

        }


        await axios.put(`${apiUrl}/specialday/form?id=${id}`, payload)

        router.back()
      } catch (err: unknown) {
        error.value = getErrorMessage(err) || '儲存失敗'
      } finally {
        loading.value = false
      }
    }



    const goBack = () => router.back()

    const houseId = ref(route.params.houseId as string | undefined)

    return { loading, error, special, onSave, goBack, formatDate, formatDateToInput, houseId, minDate }
  }
})
</script>

<style scoped>
/* placeholder */
</style>
