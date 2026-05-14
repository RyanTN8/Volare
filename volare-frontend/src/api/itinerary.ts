import client from './client'
import type { ItineraryPlan } from '../types'

export interface GenerateItineraryParams {
  destination: string
  durationDays: number
  interests: string
  budget: string
  userId?: string
  extraContext?: string
}

export async function generateItinerary(params: GenerateItineraryParams): Promise<ItineraryPlan> {
  const { data } = await client.post<ItineraryPlan>('/itinerary/generate', params)
  return data
}

export async function classifyDescription(description: string): Promise<string[]> {
  const { data } = await client.post<{ tags: string[] }>('/classify', { description })
  return data.tags
}
