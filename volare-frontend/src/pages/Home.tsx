import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, UtensilsCrossed, Map, Search } from 'lucide-react'
import clsx from 'clsx'

type Tab = 'flights' | 'restaurants' | 'itinerary'

export default function Home() {
  const [tab, setTab] = useState<Tab>('itinerary')
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-brand-700 to-brand-950 text-white py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] bg-repeat" />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Plan Your Trip with AI</h1>
          <p className="text-brand-200 text-lg mb-10">
            Get a personalized day-by-day itinerary in seconds — then find flights and restaurants to match.
          </p>

          {/* Search card */}
          <div className="bg-white rounded-2xl shadow-2xl text-slate-900 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {([
                ['itinerary', 'AI Trip Planner', <Map className="w-4 h-4" />],
                ['flights', 'Flights', <Plane className="w-4 h-4" />],
                ['restaurants', 'Restaurants', <UtensilsCrossed className="w-4 h-4" />],
              ] as [Tab, string, React.ReactNode][]).map(([id, label, icon]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
                    tab === id
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="p-6">
              {tab === 'flights' && <FlightSearchForm onSearch={p => navigate(`/flights?${p}`)} />}
              {tab === 'restaurants' && <RestaurantSearchForm onSearch={p => navigate(`/restaurants?${p}`)} />}
              {tab === 'itinerary' && <ItinerarySearchForm onSearch={p => navigate(`/itinerary?${p}`)} />}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: '✈️', title: 'Smart Flights', desc: 'Search 500+ airlines with real-time Amadeus data. Find the best deals instantly.' },
          { icon: '🍜', title: 'Local Eats', desc: 'Discover restaurants powered by Foursquare with AI-generated tags for every vibe.' },
          { icon: '🗺️', title: 'AI Itineraries', desc: 'Get a full day-by-day trip plan in seconds, enriched with real restaurant data.' },
        ].map(f => (
          <div key={f.title} className="text-center space-y-3">
            <div className="text-5xl">{f.icon}</div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-slate-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function FlightSearchForm({ onSearch }: { onSearch: (params: string) => void }) {
  const [form, setForm] = useState({ origin: '', destination: '', departureDate: '', returnDate: '', passengers: '' })
  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams(Object.fromEntries(Object.entries(form).filter(([, v]) => v)))
    onSearch(p.toString())
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <input className="input" placeholder="From (SFO)" value={form.origin} onChange={update('origin')} maxLength={3} required />
      <input className="input" placeholder="To (JFK)" value={form.destination} onChange={update('destination')} maxLength={3} required />
      <input className="input" type="date" value={form.departureDate} onChange={update('departureDate')} required />
      <input className="input" type="date" placeholder="Return (optional)" value={form.returnDate} onChange={update('returnDate')} />
      <input className="input" type="number" min={1} max={9} value={form.passengers} onChange={update('passengers')} placeholder="Passengers (e.g. 1)" />
      <button type="submit" className="btn-primary flex items-center justify-center gap-2 col-span-2 md:col-span-1">
        <Search className="w-4 h-4" /> Search
      </button>
    </form>
  )
}

function RestaurantSearchForm({ onSearch }: { onSearch: (params: string) => void }) {
  const [location, setLocation] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(new URLSearchParams({ location }).toString())
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <input
        className="input col-span-2"
        placeholder="Location (e.g. San Francisco, CA)"
        value={location}
        onChange={e => setLocation(e.target.value)}
        required
      />
      <button type="submit" className="btn-primary flex items-center justify-center gap-2 col-span-2">
        <Search className="w-4 h-4" /> Find Restaurants
      </button>
    </form>
  )
}

function ItinerarySearchForm({ onSearch }: { onSearch: (params: string) => void }) {
  const [form, setForm] = useState({ destination: '', durationDays: '', interests: '', budget: 'moderate' })
  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams(Object.fromEntries(Object.entries(form).filter(([, v]) => v)))
    onSearch(p.toString())
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <input className="input" placeholder="Destination (e.g. Tokyo)" value={form.destination} onChange={update('destination')} required />
      <input className="input" type="number" min={1} max={30} placeholder="Days (e.g. 2)" value={form.durationDays} onChange={update('durationDays')} required />
      <input className="input col-span-2" placeholder="Interests (e.g. food, history, hiking)" value={form.interests} onChange={update('interests')} required />
      <select className="input" value={form.budget} onChange={update('budget')}>
        <option value="budget">Budget</option>
        <option value="moderate">Moderate</option>
        <option value="luxury">Luxury</option>
      </select>
      <button type="submit" className="btn-primary flex items-center justify-center gap-2">
        <Map className="w-4 h-4" /> Generate Plan
      </button>
    </form>
  )
}
