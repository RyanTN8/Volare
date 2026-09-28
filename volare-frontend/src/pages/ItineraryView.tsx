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
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {!destination && !plan && (
        <div className="text-center py-24">
          <div className="w-14 h-14 rounded-full bg-[#173c35] flex items-center justify-center mx-auto mb-6">
            <Map className="w-6 h-6 text-[#f1bd6c]" />
          </div>
          <p className="text-[#c95d35] text-xs font-bold uppercase tracking-[.2em] mb-3">Start somewhere</p>
          <h1 className="font-display font-extrabold text-4xl text-[#173c35] tracking-[-.06em] mb-3">
            Your next escape awaits.
          </h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
            Head home and share a few details about where you want to go.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="max-w-xl mx-auto text-center py-24">
          <div className="w-16 h-16 rounded-full bg-[#e7efe4] flex items-center justify-center mx-auto mb-7">
            <Loader2 className="w-7 h-7 text-[#173c35] animate-spin" />
          </div>
          <p className="text-[#c95d35] text-xs font-bold uppercase tracking-[.2em] mb-3">Plotting the good bits</p>
          <h1 className="font-display font-extrabold text-3xl text-[#173c35] tracking-[-.05em]">Building your trip to {destination}.</h1>
          <p className="text-stone-500 text-sm mt-3">This usually takes about 10–20 seconds.</p>
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
          <div className="bg-[#173c35] rounded-2xl px-6 py-8 sm:p-10 mb-8 sm:mb-10 text-[#fffaf0] overflow-hidden relative">
            <div className="absolute -right-12 -bottom-16 w-56 h-56 rounded-full border border-[#f1bd6c]/30" />
            <div className="absolute right-10 -top-14 w-36 h-36 rounded-full border border-[#f1bd6c]/20" />
            <div className="relative">
              <p className="text-[#f1bd6c] text-xs font-bold uppercase tracking-[.2em] mb-3">Your travel guide</p>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-[-.065em] leading-none">
                {plan.destination}
              </h1>
              <p className="text-stone-300 mt-3 text-sm">
                {plan.durationDays}-day trip <span className="text-[#f1bd6c] px-1.5">·</span> {plan.budgetEstimate}
              </p>
            </div>

            {plan.generalTips.length > 0 && (
              <div className="relative mt-7 border-t border-white/15 pt-5 max-w-2xl">
                <p className="text-[11px] font-semibold text-[#f1bd6c] uppercase tracking-wider mb-2.5">
                  Travel Tips
                </p>
                <ul className="space-y-1.5">
                  {plan.generalTips.map((tip, i) => (
                    <li key={i} className="text-sm text-stone-200 flex items-start gap-2">
                      <span className="text-[#f1bd6c] mt-0.5 flex-shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-stone-200">
            {plan.days.map(day => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                  activeDay === day.day
                    ? 'bg-[#173c35] text-white'
                    : 'bg-[#fffdf8] border border-stone-300 text-stone-600 hover:bg-[#eae4da]'
                )}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {activeDayPlan && (
            <div key={activeDayPlan.day} className="space-y-8">
              <div className="flex items-center gap-4"><span className="w-8 h-px bg-[#c95d35]" /><h2 className="font-display font-extrabold text-2xl text-[#173c35] tracking-[-.04em]">{activeDayPlan.theme}</h2></div>
              {(['morning', 'afternoon', 'evening'] as const).map(slot => {
                const activities = activeDayPlan[slot]
                if (!activities?.length) return null
                return (
                  <div key={slot}>
                    <p className="text-[11px] font-semibold text-[#c95d35] uppercase tracking-wider mb-3">
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
          <div className="mt-14 pt-10 border-t border-stone-300">
            <div className="flex items-center gap-2 mb-5">
              <UtensilsCrossed className="w-4 h-4 text-[#c95d35]" />
              <h2 className="font-display font-extrabold text-2xl text-[#173c35] tracking-[-.04em]">
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
          <div className="mt-14 pt-10 border-t border-stone-300">
            <div className="flex items-center gap-2 mb-5">
              <Plane className="w-4 h-4 text-[#c95d35]" />
              <h2 className="font-display font-extrabold text-2xl text-[#173c35] tracking-[-.04em]">
                Getting there
              </h2>
            </div>

            <form onSubmit={submitFlightSearch} className="bg-[#fffdf8] border border-stone-200 rounded-xl p-4 mb-5">
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
              <button type="submit" className="bg-[#173c35] hover:bg-[#0f2d27] text-white px-4 py-2 rounded-lg font-semibold mt-4 flex items-center justify-center gap-2 w-full md:w-auto transition-colors">
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

          <div className="mt-12 pt-7 border-t border-stone-300 text-center">
            <button onClick={handleGenerate} className="btn-secondary text-sm border-stone-300 bg-[#fffdf8]">
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
    <div className="bg-[#fffdf8] border border-stone-200 rounded-xl p-5 flex items-start gap-4">
      <div className={clsx(
        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
        ACTIVITY_COLORS[a.type] ?? 'bg-slate-100 text-slate-600'
      )}>
        {ACTIVITY_ICONS[a.type] ?? <Map className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display font-bold text-[#173c35] text-sm leading-snug">{a.name}</h4>
          {a.priceRange && (
            <span className="text-xs text-stone-400 flex-shrink-0 tabular-nums font-semibold">{a.priceRange}</span>
          )}
        </div>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">{a.description}</p>
        {(a.location || a.estimatedDuration || a.rating) && (
          <div className="flex items-center gap-3.5 mt-2.5 text-xs text-stone-400">
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
