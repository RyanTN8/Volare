import client from './client'
import type { Restaurant } from '../types'

export interface RestaurantSearchParams {
  location: string
  term?: string
  priceTier?: string
  radius?: number
}

export async function searchRestaurants(params: RestaurantSearchParams): Promise<Restaurant[]> {
  const { data } = await client.get<Restaurant[]>('/restaurants/search', { params })
  return data
}

export async function getRestaurantDetail(id: string): Promise<Restaurant> {
  const { data } = await client.get<Restaurant>(`/restaurants/${id}`)
  return data
}
