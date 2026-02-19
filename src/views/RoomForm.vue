<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
    <h1 class="app-page-title">{{ houseName }}</h1>

    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <form>
        <div class="mb-3">
          <label class="form-label">名稱</label>
          <input class="form-control" v-model="room.name" />
        </div>
        <div class="mb-3">
          <label class="form-label">包棟</label>
          <input class="form-control-plaintext" :value="room.main ? '是' : '否'" readonly />
        </div>
        <div class="mb-3">
          <label class="form-label">價格</label>
          <input class="form-control" v-model.number="room.price" />
        </div>
        <div class="mb-3">
          <label class="form-label">加床價格</label>
          <input class="form-control" type="number" v-model.number="room.extraBedPrice" />
        </div>
        <div class="mb-3">
          <label class="form-label">加床</label>
          <select class="form-select" v-model.number="room.extraBedQty">
            <option :value="0">0</option>
            <option :value="1">1</option>
            <option :value="2">2</option>
            <option :value="3">3</option>
            <option :value="4">4</option>
            <option :value="5">5</option>
            <option :value="6">6</option>
            <option :value="7">7</option>
            <option :value="8">8</option>
            <option :value="9">9</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">描述1</label>
          <input class="form-control" v-model="room.description" />
        </div>
        <div class="mb-3">
          <label class="form-label">描述2</label>
          <input class="form-control" v-model="room.description2" />
        </div>
        <div class="mb-3">
          <label class="form-label">床與衛浴描述</label>
          <input class="form-control" v-model="room.beds" />
        </div>
        <div class="mb-3">
          <label class="form-label">谷歌通知描述</label>
          <div class="d-flex align-items-center gap-2">
            <input class="form-control" v-model="room.color" />
            <div class="d-flex align-items-center">
              <input class="form-control w-auto" style="width:5rem" v-model.number="room.pqty" />
              <span class="ms-1">人</span>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">最後更新人員</label>
          <input class="form-control" :value="room.lastUpdateUser" readonly />
        </div>
        <div class="app-card app-card-orders-table shadow-sm mb-5">
          <div class="app-card-body">
            <div class="table-responsive">
              <table class="table app-table-hover mb-0 text-left">
                <thead>
                  <tr>
                    <th style="background-color:azure" class="cell">星期</th>
                    <th style="background-color:azure" class="cell">金額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="cell">星期日</td>
                    <td class="cell"><input class="form-control" v-model.number="room.day0" /></td>
                  </tr>
                  <tr>
                    <td class="cell">星期一</td>
                    <td class="cell"><input class="form-control" v-model.number="room.day1" /></td>
                  </tr>
                  <tr>
                    <td class="cell">星期二</td>
                    <td class="cell"><input class="form-control" v-model.number="room.day2" /></td>
                  </tr>
                  <tr>
                    <td class="cell">星期三</td>
                    <td class="cell"><input class="form-control" v-model.number="room.day3" /></td>
                  </tr>
                  <tr>
                    <td class="cell">星期四</td>
                    <td class="cell"><input class="form-control" v-model.number="room.day4" /></td>
                  </tr>
                  <tr>
                    <td class="cell">星期五</td>
                    <td class="cell"><input class="form-control" v-model.number="room.day5" /></td>
                  </tr>
                  <tr>
                    <td class="cell">星期六</td>
                    <td class="cell"><input class="form-control" v-model.number="room.day6" /></td>
                  </tr>
                </tbody>
              </table>
            </div><!--//table-responsive-->
          </div><!--//app-card-body-->
        </div>

        <div class="d-flex align-items-center">
          <!-- 左邊按鈕群 -->
          <div>
            <button class="btn btn-primary ms-2" type="submit" @click.prevent="onSave" :disabled="saving">
              儲存
            </button>

            <button class="btn btn-secondary ms-2" type="button" @click="goBack" :disabled="navigating">
              返回
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
import type { Room } from '@/types/room'
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
  name: 'RoomForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const id = route.params.id as string | undefined

    const loading = ref(false)
    const error = ref<string | null>(null)
    const houseName = ref('')
    const room = ref<Partial<Room>>({})

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
        // 如果是序列化的物件，回傳特定欄位，否則回傳字串
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



    const fetchRoom = async (roomId: string) => {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get<Room>(`${apiUrl}/room/form?id=${roomId}`)
        room.value = res.data
        const houseId = room.value.houseId
        if (houseId === 1) {
          houseName.value = '無憂'
        } else if (houseId === 2) {
          houseName.value = '寄寓'
        } else if (houseId === 3) {
          houseName.value = '上水'
        } else if (houseId === 4) {
          houseName.value = '花水木'
        } else if (houseId === 5) {
          houseName.value = '避風港'
        }
      } catch (err: unknown) {
        error.value = getErrorMessage(err)
      } finally {
        loading.value = false
      }
    }

    if (id) {
      // 如果有 id，載入該房型
      fetchRoom(id)
    }

    const onSave = async () => {
      if (saving.value) return
      saving.value = true
      // 範例：如果有 id，put 更新，否則 post 建立
      try {
        if (id) {

          const payload = {
            name: room.value?.name,
            id: room.value?.id,
            price: room.value?.price,
            extraBedPrice: room.value?.extraBedPrice,
            extraBedQty: room.value?.extraBedQty,
            description: room.value?.description,
            description2: room.value?.description2,
            beds: room.value?.beds,
            color: room.value?.color,
            pqty: room.value?.pqty,
            day0: room.value?.day0,
            day1: room.value?.day1,
            day2: room.value?.day2,
            day3: room.value?.day3,
            day4: room.value?.day4,
            day5: room.value?.day5,
            day6: room.value?.day6,
            lastUpdateUser: displayUser.value || '',
          }
          await axios.put(`${apiUrl}/room/form?id=${id}`, payload)
          const fgparam = route.query.fg as string | undefined
          if (fgparam === '1') {
            router.replace('/index')
          } else {
            router.back()
          }
        } else {
          //尚未實作後台新增
          // await axios.post(`${apiUrl}/room/form`, room.value)
        }

      } catch (err: unknown) {
        error.value = getErrorMessage(err) || '儲存失敗'
      }
      finally {
        saving.value = false
      }
    }


    const goBack = () => {
      if (navigating.value) return
      navigating.value = true
      router.back()
      // navigating flag will be irrelevant after navigation
    }

    return { loading, error, room, houseName, onSave, goBack, formatDate, formatDateToInput, saving, cancelling, navigating, displayUser }
  }
})
</script>

<style scoped>
/* placeholder */
</style>
