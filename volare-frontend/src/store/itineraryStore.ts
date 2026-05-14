import { create } from 'zustand'
import type { ItineraryPlan } from '../types'

interface ItineraryStore {
  plan: ItineraryPlan | null
  /** Signature of the search params the plan was generated for. */
  signature: string | null
  setPlan: (plan: ItineraryPlan, signature: string) => void
}

/**
 * Holds the most recently generated itinerary. As a module-level store it
 * survives navigating between pages, but resets on a full page reload.
 */
export const useItineraryStore = create<ItineraryStore>(set => ({
  plan: null,
  signature: null,
  setPlan: (plan, signature) => set({ plan, signature }),
}))
