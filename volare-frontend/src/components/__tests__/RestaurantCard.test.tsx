import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import RestaurantCard from '../RestaurantCard'
import type { Restaurant } from '../../types'

const baseRestaurant: Restaurant = {
  id: 'abc123',
  name: 'Tartine Bakery',
  imageUrl: null,
  url: 'https://tartinebakery.com',
  rating: 4.8,
  reviewCount: 5000,
  priceRange: '$$',
  categories: ['Bakery', 'Coffee'],
  location: { address: '600 Guerrero St', city: 'San Francisco', state: 'CA', country: 'US', latitude: 37.76, longitude: -122.42 },
  phone: '(415) 487-2600',
  isClosed: false,
  distanceMeters: 0,
  tags: null,
}

describe('RestaurantCard', () => {
  it('renders name and rating', () => {
    render(
      <MemoryRouter>
        <RestaurantCard restaurant={baseRestaurant} />
      </MemoryRouter>
    )
    expect(screen.getByText('Tartine Bakery')).toBeInTheDocument()
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })

  it('shows Closed badge when isClosed', () => {
    render(
      <MemoryRouter>
        <RestaurantCard restaurant={{ ...baseRestaurant, isClosed: true }} />
      </MemoryRouter>
    )
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('renders fallback emoji when no image', () => {
    render(
      <MemoryRouter>
        <RestaurantCard restaurant={baseRestaurant} />
      </MemoryRouter>
    )
    expect(screen.getByText('🍽')).toBeInTheDocument()
  })
})
