import client from './client'
import type { SavedItem, UserPreferences } from '../types'

export interface UpsertPreferencesParams {
  email: string
  displayName?: string
  preferences?: Record<string, unknown>
}

export async function upsertPreferences(params: UpsertPreferencesParams): Promise<UserPreferences> {
  const { data } = await client.post<UserPreferences>('/users/preferences', params)
  return data
}

export async function getPreferences(userId: string): Promise<UserPreferences> {
  const { data } = await client.get<UserPreferences>(`/users/${userId}/preferences`)
  return data
}

export async function saveItem(params: {
  userId: string
  externalId: string
  type: 'FLIGHT' | 'RESTAURANT'
  payload?: Record<string, unknown>
}): Promise<SavedItem> {
  const { data } = await client.post<SavedItem>('/users/saved-items', params)
  return data
}

export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  const { data } = await client.get<SavedItem[]>(`/users/${userId}/saved-items`)
  return data
}

export async function removeSavedItem(userId: string, externalId: string): Promise<void> {
  await client.delete(`/users/${userId}/saved-items/${externalId}`)
}
