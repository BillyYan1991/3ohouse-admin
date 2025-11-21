export interface Booking {
  id: number
  houseId: number
  userName: string
  email: string
  phone: string
  memo: string
  totalPrice: number
  nights: number
  prepayment: number
  adjustment: number
  paid: number
  paymentMethod: string
  paymemo: string
  admin_memo: string
  orderNo: string
  checkIn: string
  checkOut: string
  status: number
  createdAt: string
  house: House
  details: BookingDetail[]
}

export interface House {
  id: number
  name: string
  description: string | null
  bankName: string
  accountName: string
  accountNumber: string
}

export interface BookingDetail {
  id: number
  bookingId: number
  roomId: number
  extraBedQty: number
  extraBedPrice: number
  babyBedQty: number
  qty: number
  price: number
  lock: boolean
  checkIn: string
  checkOut: string
  room: Room
}

export interface Room {
  id: number
  houseId: number
  name: string
  description: string
  description2: string
  beds: string
  amenities: string | null
  price: number
  qty: number
  extraBedQty: number
  extraBedPrice: number
  babyBedQty: number
  main: boolean
}
