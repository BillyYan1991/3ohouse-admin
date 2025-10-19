import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    booking: useStorage<Booking>('booking-data', {
      houseId: 0,
      houseName: '',
      totalPrice: 0,
      prepayment: 0,
      checkIn: '',
      checkOut: '',
      details: [],
      userName: '',
      email: '',
      phone: '',
      memo: '',
      paymentMethod: '',
      paymemo: '',
      nights: 0,
      bankName: '',
      accountNumber: '',
      accountName: '',
    }),
  }),

  actions: {
    setBooking(data: Partial<Booking>) {
      Object.assign(this.booking, data)
    },

    clearBooking() {
      // 清空整個 booking 並移除 localStorage
      this.booking = {
        houseId: 0,
        houseName: '',
        totalPrice: 0,
        prepayment: 0,
        checkIn: '',
        checkOut: '',
        details: [],
        userName: '',
        email: '',
        phone: '',
        memo: '',
        paymentMethod: '',
        paymemo: '',
        nights: 0,
        bankName: '',
        accountName: '',
        accountNumber: '',
      }
      localStorage.removeItem('booking-data')
    },
  },
})

// Booking 型別定義
export interface Booking {
  houseId: number
  houseName: string
  totalPrice: number
  prepayment: number
  nights: number
  checkIn: string
  checkOut: string
  details: BookingDetail[]

  userName: string
  email: string
  phone: string
  memo: string
  paymentMethod: string
  paymemo: string
  bankName: string
  accountName: string
  accountNumber: string
}

export interface BookingDetail {
  roomId: number
  roomName: string
  qty: number
  price: number
  extraBedQty: number
  extraBedPrice: number
  babyBedQty: number
}
