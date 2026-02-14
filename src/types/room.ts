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
  day0: number
  day1: number
  day2: number
  day3: number
  day4: number
  day5: number
  day6: number
  color: string
  pqty: number
  lastUpdateUser: string
}
