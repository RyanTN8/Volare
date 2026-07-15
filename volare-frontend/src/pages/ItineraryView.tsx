import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { memo, useEffect, useMemo, useState } from 'react'
import { generateItinerary } from '../api/itinerary'
import { searchRestaurants } from '../api/restaurants'
import { searchFlights, type FlightSearchParams } from '../api/flights'
import { useItineraryStore } from '../store/itineraryStore'
import RestaurantCard from '../components/RestaurantCard'
import FlightCard from '../components/FlightCard'
import ErrorMessage from '../components/ErrorMessage'
import { SkeletonList, SkeletonFlightList } from '../components/SkeletonCard'
import type { Activity } from '../types'
import { Map, Loader2, UtensilsCrossed, Camera, Zap, MapPin, Clock, Star, Plane, Search } from 'lucide-react'
import clsx from 'clsx'

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  RESTAURANT: <UtensilsCrossed className="w-4 h-4" />,
  ATTRACTION: <Camera className="w-4 h-4" />,
  ACTIVITY:   <Zap className="w-4 h-4" />,
}

const ACTIVITY_COLORS: Record<string, string> = {
  RESTAURANT: 'bg-amber-50 text-amber-700',
  ATTRACTION: 'bg-sky-50 text-sky-700',
  ACTIVITY:   'bg-emerald-50 text-emerald-700',
}

function paramsSignature(params: URLSearchParams): string {
  return [
    params.get('destination') ?? '',
    params.get('durationDays') ?? '',
    params.get('interests') ?? '',
    params.get('budget') ?? '',
  ].join('|')
}

export default function ItineraryView() {
  const [params]    = useSearchParams()
  const signature   = paramsSignature(params)
  const destination = params.get('destination')
  const [activeDay, setActiveDay] = useState(1)
  const [searchTriggered, setSearchTriggered] = useState(false)

  const { plan: storedPlan, signature: storedSignature, setPlan } = useItineraryStore()
  const plan = storedPlan && (!destination || storedSignature === signature) ? storedPlan : null

  const activeDayPlan = useMemo(
    () => plan?.days.find(d => d.day === activeDay) ?? null,
    [plan, activeDay]
  )

  // Restaurants load in parallel with itinerary generation — the fast Foursquare
  // call usually resolves while Gemini is still working.
  const searchDestination = destination ?? plan?.destination ?? ''
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants', searchDestination],
    queryFn:  () => searchRestaurants({ location: searchDestination }),
    enabled:  (searchTriggered || !!plan) && !!searchDestination,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  })

  // Flights need an origin airport + dates, which the itinerary form doesn't
  // collect — searched via an inline form instead of auto-loading.
  const [flightForm, setFlightForm] = useState({
    origin: '', destination: '', departureDate: '', returnDate: '', passengers: '',
  })
  const [flightQuery, setFlightQuery] = useState<FlightSearchParams | null>(null)
  const updateFlightForm = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFlightForm(f => ({ ...f, [k]: e.target.value }))

  const {
    data: flights, isLoading: flightsLoading,
    isError: flightsError, error: flightErr, refetch: refetchFlights,
  } = useQuery({
    queryKey: ['flights', flightQuery],
    queryFn:  () => searchFlights(flightQuery!),
    enabled:  !!flightQuery,
    staleTime: 5 * 60 * 1000,
  })

  const submitFlightSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFlightQuery({
      origin: flightForm.origin,
      destination: flightForm.destination,
      departureDate: flightForm.departureDate,
      returnDate: flightForm.returnDate || undefined,
      passengers: flightForm.passengers ? parseInt(flightForm.passengers) : 1,
    })
  }

  const mutation = useMutation({
    mutationFn: generateItinerary,
    onSuccess: data => {
      setPlan(data, signature)
      setActiveDay(1)
    },
  })

  const handleGenerate = () => {
    setSearchTriggered(true)
    mutation.mutate({
      destination:  params.get('destination') ?? '',
      durationDays: parseInt(params.get('durationDays') ?? '2'),
      interests:    params.get('interests') ?? 'food, culture, sightseeing',
      budget:       params.get('budget') ?? 'moderate',
    })
  }

  // Generation starts automatically as soon as we land here with a destination —
  // the Home form is the only place that kicks this off now.
  useEffect(() => {
    if (destination && !plan && !searchTriggered) {
      handleGenerate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, plan, searchTriggered])

  const isGenerating = mutation.isPending || (!!destination && !plan && !mutation.isError)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {!destination && !plan && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-brand-900 flex items-center justify-center mx-auto mb-5">
            <Map className="w-6 h-6 text-brand-300" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight mb-2">
            Plan a Trip
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Go to Home and use the "Plan a Trip" form to get started.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center gap-4 py-24">
          <Loader2 className="w-10 h-10 text-brand-700 animate-spin" />
          <p className="text-slate-700 font-semibold">Crafting your personalized itinerary…</p>
          <p className="text-slate-400 text-sm">This takes about 10–20 seconds</p>
        </div>
      )}

      {mutation.isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-4">{(mutation.error as Error).message}</p>
          <button onClick={handleGenerate} className="btn-secondary">Retry</button>
        </div>
      )}

      {plan && (
        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-tight">
              {plan.destination}
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              {plan.durationDays}-day trip · {plan.budgetEstimate}
            </p>

            {plan.generalTips.length > 0 && (
              <div className="mt-5 card p-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Travel Tips
                </p>
                <ul className="space-y-1.5">
                  {plan.generalTips.map((tip, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-slate-300 mt-0.5 flex-shrink-0">·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Day tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
            {plan.days.map(day => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeDay === day.day
                    ? 'bg-brand-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {activeDayPlan && (
            <div key={activeDayPlan.day} className="space-y-7">
              <h2 className="font-display font-bold text-lg text-slate-900">{activeDayPlan.theme}</h2>
              {(['morning', 'afternoon', 'evening'] as const).map(slot => {
                const activities = activeDayPlan[slot]
                if (!activities?.length) return null
                return (
                  <div key={slot}>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      {slot}
                    </p>
                    <div className="space-y-3">
                      {activities.map((act, i) => (
                        <ActivityCard key={i} activity={act} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Restaurants — loaded in parallel with the itinerary */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-5">
              <UtensilsCrossed className="w-4 h-4 text-brand-700" />
              <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Where to eat in {plan.destination}
              </h2>
            </div>

            {restaurantsLoading && <SkeletonList count={6} />}

            {!restaurantsLoading && restaurants && restaurants.length === 0 && (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-9 h-9 mx-auto mb-3 text-slate-200" />
                <p className="text-slate-500 text-sm">No restaurants found for {plan.destination}.</p>
              </div>
            )}

            {restaurants && restaurants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            )}
          </div>

          {/* Flights — inline search since origin airport + dates aren't in the itinerary */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-5">
              <Plane className="w-4 h-4 text-brand-700" />
              <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Getting there
              </h2>
            </div>

            <form onSubmit={submitFlightSearch} className="card p-4 mb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  className="input" placeholder="From (e.g. SFO)" maxLength={3} required
                  value={flightForm.origin} onChange={updateFlightForm('origin')}
                />
                <input
                  className="input" placeholder="To (e.g. NRT)" maxLength={3} required
                  value={flightForm.destination} onChange={updateFlightForm('destination')}
                />
                <input
                  className="input" type="date" required
                  value={flightForm.departureDate} onChange={updateFlightForm('departureDate')}
                />
                <input
                  className="input" type="date"
                  value={flightForm.returnDate} onChange={updateFlightForm('returnDate')}
                />
                <input
                  className="input" type="number" min={1} max={9} placeholder="Passengers"
                  value={flightForm.passengers} onChange={updateFlightForm('passengers')}
                />
              </div>
              <button type="submit" className="btn-primary mt-4 flex items-center justify-center gap-2 w-full md:w-auto">
                <Search className="w-4 h-4" /> Search flights
              </button>
            </form>

            {flightsLoading && <SkeletonFlightList count={4} />}

            {flightsError && (
              <ErrorMessage message={(flightErr as Error).message} onRetry={() => refetchFlights()} />
            )}

            {flights && flights.length === 0 && (
              <div className="text-center py-12">
                <Plane className="w-9 h-9 mx-auto mb-3 text-slate-200" />
                <p className="text-slate-500 text-sm">No flights found for this route. Try different dates.</p>
              </div>
            )}

            {flights && flights.length > 0 && (
              <div className="space-y-3">
                {flights.map(f => <FlightCard key={f.id} flight={f} />)}
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <button onClick={handleGenerate} className="btn-secondary text-sm">
              Generate a different plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const ActivityCard = memo(function ActivityCard({ activity: a }: { activity: Activity }) {
  return (
    <div className="card p-4 flex items-start gap-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      <div className={clsx(
        'w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0',
        ACTIVITY_COLORS[a.type] ?? 'bg-slate-100 text-slate-600'
      )}>
        {ACTIVITY_ICONS[a.type] ?? <Map className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display font-bold text-slate-900 text-sm leading-snug">{a.name}</h4>
          {a.priceRange && (
            <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums font-semibold">{a.priceRange}</span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{a.description}</p>
        {(a.location || a.estimatedDuration || a.rating) && (
          <div className="flex items-center gap-3.5 mt-2.5 text-xs text-slate-400">
            {a.location         && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" /> {a.location}
              </span>
            )}
            {a.estimatedDuration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" /> {a.estimatedDuration}
              </span>
            )}
            {a.rating && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold tabular-nums">
                <Star className="w-3 h-3 fill-current" /> {a.rating.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
