<template>
  <div class="app-content pt-3 p-md-3 p-lg-4">
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
                  <th class="cell">天數</th>
                  <th class="cell">金額</th>
                  <th class="cell"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookings" :key="booking.id ?? booking.houseId">
                  <td class="cell">{{ booking.id ?? booking.houseId }}</td>
                  <td class="cell"><span class="truncate">{{ booking.houseName }}</span></td>
                  <td class="cell">{{ booking.userName }}</td>
                  <td class="cell"><span>{{ formatDate(booking.checkIn) }}</span></td>
                  <td class="cell"><span>{{ formatDate(booking.checkOut) }}</span></td>
                  <td class="cell">{{ booking.nights ?? 0 }}</td>
                  <td class="cell">{{ formatCurrency(booking.totalPrice) }}</td>
                  <td class="cell"><a class="btn-sm app-btn-secondary" href="#">View</a></td>
                </tr>
                <!-- booking details (nested) -->
                <tr v-for="booking in bookings" :key="(booking.id ?? booking.houseId) + '-details'"
                  v-if="booking.details && booking.details.length">
                  <td class="cell" colspan="8">
                    <div v-for="(d, idx) in booking.details" :key="idx" class="mb-2">
                      <strong>Detail {{ idx + 1 }}:</strong>
                      <pre style="white-space:pre-wrap;margin:0">{{ JSON.stringify(d, null, 2) }}</pre>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="cell">#15345</td>
                  <td class="cell"><span class="truncate">Consectetur adipiscing elit</span></td>
                  <td class="cell">Dylan Ambrose</td>
                  <td class="cell"><span class="cell-data">16 Oct</span><span class="note">03:16 AM</span></td>
                  <td class="cell"><span class="badge bg-warning">Pending</span></td>
                  <td class="cell">$96.20</td>
                  <td class="cell"><a class="btn-sm app-btn-secondary" href="#">View</a></td>
                </tr>
                <tr>
                  <td class="cell">#15344</td>
                  <td class="cell"><span class="truncate">Pellentesque diam imperdiet</span></td>
                  <td class="cell">Teresa Holland</td>
                  <td class="cell"><span class="cell-data">16 Oct</span><span class="note">01:16 AM</span></td>
                  <td class="cell"><span class="badge bg-success">Paid</span></td>
                  <td class="cell">$123.00</td>
                  <td class="cell"><a class="btn-sm app-btn-secondary" href="#">View</a></td>
                </tr>

                <tr>
                  <td class="cell">#15343</td>
                  <td class="cell"><span class="truncate">Vestibulum a accumsan lectus sed mollis ipsum</span></td>
                  <td class="cell">Jayden Massey</td>
                  <td class="cell"><span class="cell-data">15 Oct</span><span class="note">8:07 PM</span></td>
                  <td class="cell"><span class="badge bg-success">Paid</span></td>
                  <td class="cell">$199.00</td>
                  <td class="cell"><a class="btn-sm app-btn-secondary" href="#">View</a></td>
                </tr>

                <tr>
                  <td class="cell">#15342</td>
                  <td class="cell"><span class="truncate">Justo feugiat neque</span></td>
                  <td class="cell">Reina Brooks</td>
                  <td class="cell"><span class="cell-data">12 Oct</span><span class="note">04:23 PM</span></td>
                  <td class="cell"><span class="badge bg-danger">Cancelled</span></td>
                  <td class="cell">$59.00</td>
                  <td class="cell"><a class="btn-sm app-btn-secondary" href="#">View</a></td>
                </tr>

                <tr>
                  <td class="cell">#15341</td>
                  <td class="cell"><span class="truncate">Morbi vulputate lacinia neque et sollicitudin</span></td>
                  <td class="cell">Raymond Atkins</td>
                  <td class="cell"><span class="cell-data">11 Oct</span><span class="note">11:18 AM</span></td>
                  <td class="cell"><span class="badge bg-success">Paid</span></td>
                  <td class="cell">$678.26</td>
                  <td class="cell"><a class="btn-sm app-btn-secondary" href="#">View</a></td>
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

import axios from 'axios'


const apiUrl = import.meta.env.VITE_API_URL

interface Booking {
  id?: number
  houseId: number
  houseName: string
  totalPrice: number
  prepayment: number
  checkIn: string
  checkOut: string
  details: unknown[]
  userName: string
  email: string
  phone: string
  memo: string
  paymentMethod: string
  paymemo: string
  nights: number
  bankName: string
  accountNumber: string
  accountName: string
  <tbody>
                <template v-for= "booking in bookings" : key = "booking.id ?? booking.houseId" >
  <tr>
  <td class="cell" > {{ booking.id ?? booking.houseId }}</td>
    < td class="cell" > <span class="truncate" > {{ booking.houseName }}</span></td >
      <td class="cell" > {{ booking.userName }}</td>
        < td class="cell" > <span>{{ formatDate(booking.checkIn) }}</span></td >
          <td class="cell" > <span>{{ formatDate(booking.checkOut) }}</span></td >
            <td class="cell" > {{ booking.nights ?? 0 }}</td>
              < td class="cell" > {{ formatCurrency(booking.totalPrice) }}</td>
                < td class="cell" > <a class="btn-sm app-btn-secondary" href = "#" > View < /a></td >
                  </tr>
                  < tr v -if= "booking.details && booking.details.length" >
                    <td class= "cell" colspan = "8" >
                      <div v -for= "(d, idx) in booking.details" : key = "idx" class="mb-2" >
                        <strong>Detail { { idx + 1 } }: </strong>
                          < pre style = "white-space:pre-wrap;margin:0" > {{ JSON.stringify(d, null, 2) }}</pre>
                            </div>
                            </td>
                            </tr>
                            </template>
                            </tbody>

onMounted(async () => {
  // 取得房間
  try {
    const res = await axios.get<Booking[]>(`${apiUrl}/home/pending`)
    console.log('房間資料：', res.data)
    bookings.value = res.data
  } catch (err) {
    console.error('無法取得未處裡訂房資料', err)
  }
})

return { bookings, formatDate, formatCurrency }
  }
})
</script>

<style scoped>
/* simple placeholder */
</style>
