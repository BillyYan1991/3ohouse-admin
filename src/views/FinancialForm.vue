<template>
  <div class="container py-4">
    <h3>年度收支檢視</h3>

    <div class="row mb-3 align-items-center">
      <div class="col-auto">
        <label for="yearSelect" class="form-label">選擇年度</label>
        <select id="yearSelect" class="form-select" v-model.number="selectedYear">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div class="col-auto mt-4">
        <div v-if="loading" class="text-muted">載入中…</div>
        <div v-if="error" class="text-danger">{{ error }}</div>
      </div>
    </div>

    <div v-if="!loading">
      <div v-if="housesFiltered.length > 0">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>月份</th>
              <th v-for="h in housesFiltered" :key="h.houseId" class="text-center">{{ h.houseName }}</th>
              <th class="text-end">當月小計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in 12" :key="m">
              <td>{{ m }} 月</td>
              <td v-for="h in housesFiltered" :key="h.houseId" class="text-end">{{
                formatCurrency(houseMaps[h.houseId]?.[m]?.total) }}</td>
              <td class="text-end"><strong>{{ formatCurrency(monthlySubtotal[m]) }}</strong></td>
            </tr>
            <tr>
              <td><strong>合計</strong></td>
              <td v-for="h in housesFiltered" :key="h.houseId" class="text-end"><strong>{{
                formatCurrency(totalPerHouse[h.houseId] || 0) }}</strong></td>
              <td class="text-end"><strong>{{ formatCurrency(overallTotal) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>月份</th>
              <th class="text-end">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in 12" :key="m">
              <td>{{ m }} 月</td>
              <td class="text-end">{{ formatCurrency(monthAmounts[m]?.total) }}</td>
            </tr>
            <tr>
              <td><strong>合計</strong></td>
              <td class="text-end"><strong>{{ formatCurrency(total) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { authFetch } from '@/utils/auth'
const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080'


// 建議後端 endpoint: GET {base}/api/financials?year=YYYY
// 回傳格式範例 1 (物件): { months: { "1": 1000, "2": 2000, ... } }
// 或範例 2 (陣列)：單一 house（你給的範例）：
// [ { houseId, houseName, year, monthly: [ { month:1, paid:0, totalPrice:1000 }, ... ] } ]
// 或簡單陣列：{ data: [1000,2000,...] } (index 0 -> 1月)

const currentYear = new Date().getFullYear()
const years = ref<number[]>([])
// 預設下拉為 2025~2029
const baseStart = 2025
const baseEnd = 2029
for (let y = baseStart; y <= baseEnd; y++) years.value.push(y)
// 若 currentYear 不在 2025~2029，將其放到選單最前面，並預設為 currentYear
if (!years.value.includes(currentYear)) {
  years.value.unshift(currentYear)
}

const selectedYear = ref<number>(currentYear)
const houses = ref<Array<{ houseId: number; houseName: string; year?: number; monthly: Array<Record<string, unknown>> }>>([])
const monthAmounts = ref<Record<number, { total: number; paid: number }>>({})
const loading = ref(false)
const error = ref<string | null>(null)

// 以選擇的年度過濾民宿（如果後端回傳多間民宿）
const housesFiltered = computed(() => {
  return houses.value.filter(h => Number(h.year ?? selectedYear.value) === selectedYear.value)
})

// 為每個民宿產生 1..12 的 month map: { [houseId]: {1: {total,paid}, ... } }
const houseMaps = computed<Record<number, Record<number, { total: number; paid: number }>>>(() => {
  const out: Record<number, Record<number, { total: number; paid: number }>> = {}
  housesFiltered.value.forEach(h => {
    const map: Record<number, { total: number; paid: number }> = {}
    for (let i = 1; i <= 12; i++) map[i] = { total: 0, paid: 0 }
    if (Array.isArray(h.monthly)) {
      h.monthly.forEach(m => {
        const mon = Number(m['month'] ?? 0) || 0
        if (mon >= 1 && mon <= 12) {
          map[mon] = { total: Number(m['totalPrice'] ?? m['total'] ?? 0) || 0, paid: Number(m['paid'] ?? 0) || 0 }
        }
      })
    }
    out[Number(h.houseId) || 0] = map
  })
  return out
})

// keep per-house totals available if needed
// computeTotalsForHouse removed — totals are provided by `totalPerHouse` / `overallTotal`

// 每月小計（合併所有民宿的 total）
const monthlySubtotal = computed(() => {
  const out: Record<number, number> = {}
  for (let i = 1; i <= 12; i++) {
    let s = 0
    housesFiltered.value.forEach(h => {
      const hid = Number(h.houseId) || 0
      s += Number(houseMaps.value[hid]?.[i]?.total || 0)
    })
    out[i] = s
  }
  return out
})

// 每間民宿年合計
const totalPerHouse = computed<Record<number, number>>(() => {
  const out: Record<number, number> = {}
  housesFiltered.value.forEach(h => {
    let s = 0
    for (let i = 1; i <= 12; i++) {
      s += Number(houseMaps.value[h.houseId]?.[i]?.total || 0)
    }
    out[h.houseId] = s
  })
  return out
})

const overallTotal = computed(() => {
  let s = 0
  for (let i = 1; i <= 12; i++) s += Number(monthlySubtotal.value[i] || 0)
  return s
})

function formatCurrency(v?: number | null) {
  if (v === undefined || v === null) return '-'
  return v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const total = computed(() => {
  let s = 0
  for (let i = 1; i <= 12; i++) {
    s += Number(monthAmounts.value[i]?.total || 0)
  }
  return s
})

// (實付欄位已隱藏 / 不顯示)

async function fetchData() {
  error.value = null
  loading.value = true
  try {
    const url = `${apiUrl}/financial/summaryByYear?year=${selectedYear.value}`
    const res = await authFetch(url)
    // 只讀一次 body，避免 body stream already read
    const raw = await res.text()
    let data: unknown = null
    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      data = raw
    }
    if (!res.ok) {
      const txt = data && typeof data === 'object' ? JSON.stringify(data) : String(raw || `fetch failed: ${res.status}`)
      throw new Error(txt)
    }

    // 支援多種回傳格式，將結果轉為 { total, paid }
    const monthsMap: Record<number, { total: number; paid: number }> = {}
    if (data) {
      const payload = data as unknown

      // 你的格式：陣列，第一個物件有 monthly 陣列
      if (Array.isArray(payload) && (payload as unknown[]).length > 0) {
        // 如果 payload 是多個 house 的陣列，儲存到 houses，並選擇第一個作為預設
        const arr = payload as unknown[]
        houses.value = (arr as unknown[]).map((it) => {
          const o = it as Record<string, unknown>
          return {
            houseId: Number(o['houseId'] ?? 0) || 0,
            houseName: String(o['houseName'] ?? o['name'] ?? '未知'),
            year: Number(o['year'] ?? selectedYear.value) || selectedYear.value,
            monthly: Array.isArray(o['monthly']) ? (o['monthly'] as unknown[]).map(x => x as Record<string, unknown>) : [],
          }
        })
        // 已將所有民宿儲存於 houses.value，前端改為顯示所有民宿（或以年度過濾）
      }

      if (payload && typeof payload === 'object') {
        const obj = payload as Record<string, unknown>
        const maybeData = obj['data']
        if (Array.isArray(maybeData) && (maybeData as unknown[]).length >= 12) {
          ; (maybeData as unknown[]).slice(0, 12).forEach((v: unknown, idx: number) => {
            monthsMap[idx + 1] = { total: Number(String(v)) || 0, paid: 0 }
          })
        } else if (obj['months'] && typeof obj['months'] === 'object') {
          const monthsObj = obj['months'] as Record<string, unknown>
          for (let i = 1; i <= 12; i++) {
            const key = String(i)
            monthsMap[i] = { total: Number(monthsObj[key] ?? monthsObj[i] ?? 0) || 0, paid: 0 }
          }
        } else if (obj['monthsMap'] && typeof obj['monthsMap'] === 'object') {
          const mm = obj['monthsMap'] as Record<string, unknown>
          for (let i = 1; i <= 12; i++) {
            monthsMap[i] = { total: Number(mm[String(i)] ?? mm[i] ?? 0) || 0, paid: 0 }
          }
        } else if (obj['monthsArray'] && Array.isArray(obj['monthsArray'])) {
          ; (obj['monthsArray'] as unknown[]).slice(0, 12).forEach((v: unknown, idx: number) => {
            monthsMap[idx + 1] = { total: Number(String(v)) || 0, paid: 0 }
          })
        } else {
          // 平坦物件 1..12
          for (let i = 1; i <= 12; i++) {
            monthsMap[i] = { total: Number(obj[String(i)] ?? 0) || 0, paid: 0 }
          }
        }
      }
    }
    monthAmounts.value = monthsMap
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    error.value = msg
    monthAmounts.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// 當使用者改變年份時自動重新載入資料（不需要按下載入按鈕）
watch(selectedYear, () => {
  fetchData()
})

// 當選擇的 house 或 year 變更時，自動把 monthAmounts 更新為該 house 的 monthly
// 不再使用 selectedHouseId；列出所有民宿時使用 houseMaps/computed
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
