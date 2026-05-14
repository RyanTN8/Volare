import client from './client'
import type { FlightOffer } from '../types'

export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers?: number
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const { data } = await client.get<FlightOffer[]>('/flights/search', { params })
  return data
}
