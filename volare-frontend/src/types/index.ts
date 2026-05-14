export interface RestaurantLocation {
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

export interface Restaurant {
  id: string
  name: string
  imageUrl: string | null
  url: string
  rating: number
  reviewCount: number
  priceRange: string | null
  categories: string[]
  location: RestaurantLocation | null
  phone: string | null
  isClosed: boolean
  distanceMeters: number
  tags: string[] | null
}

export interface FlightSegment {
  departureIataCode: string
  departureTime: string
  arrivalIataCode: string
  arrivalTime: string
  carrierCode: string
  flightNumber: string
  aircraft: string | null
  duration: string
  numberOfStops: number
}

export interface FlightItinerary {
  duration: string
  segments: FlightSegment[]
}

export interface FlightPrice {
  currency: string
  total: string
  base: string
}

export interface FlightOffer {
  id: string
  source: string
  oneWay: boolean
  numberOfBookableSeats: number
  itineraries: FlightItinerary[]
  price: FlightPrice
  validatingAirlineCodes: string | null
}

export interface Activity {
  name: string
  description: string
  type: 'RESTAURANT' | 'ATTRACTION' | 'ACTIVITY'
  estimatedDuration: string
  location: string
  rating?: number
  priceRange?: string
  fsqId?: string
}

export interface DayPlan {
  day: number
  theme: string
  morning: Activity[]
  afternoon: Activity[]
  evening: Activity[]
}

export interface ItineraryPlan {
  id: string
  destination: string
  durationDays: number
  days: DayPlan[]
  generalTips: string[]
  budgetEstimate: string
}

export interface UserPreferences {
  id: string
  email: string
  displayName: string | null
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SavedItem {
  id: string
  userId: string
  externalId: string
  itemType: 'FLIGHT' | 'RESTAURANT'
  payload: Record<string, unknown>
  savedAt: string
}

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail: string
  timestamp: string
}
