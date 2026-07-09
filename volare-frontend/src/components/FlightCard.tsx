import { memo } from 'react'
import { Plane, Clock, Users } from 'lucide-react'
import type { FlightOffer } from '../types'

interface Props {
  flight: FlightOffer
  onSave?: () => void
}

function formatDuration(iso: string) {
  return iso.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim()
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default memo(function FlightCard({ flight, onSave }: Props) {
  const outbound = flight.itineraries[0]
  const first = outbound?.segments[0]
  const last = outbound?.segments[outbound.segments.length - 1]
  const stops = outbound?.segments.length - 1

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-4">
        {/* Route */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-center min-w-[60px]">
            <p className="text-lg font-bold text-slate-900">{first?.departureIataCode}</p>
            <p className="text-sm text-slate-500">{first ? formatTime(first.departureTime) : '—'}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {outbound ? formatDuration(outbound.duration) : '—'}
            </div>
            <div className="relative w-full flex items-center">
              <div className="h-px flex-1 bg-slate-200" />
              <Plane className="w-4 h-4 text-brand-500 mx-1 rotate-90" />
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <p className="text-xs text-slate-400">
              {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="text-center min-w-[60px]">
            <p className="text-lg font-bold text-slate-900">{last?.arrivalIataCode}</p>
            <p className="text-sm text-slate-500">{last ? formatTime(last.arrivalTime) : '—'}</p>
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-600">
              {flight.price.currency} {parseFloat(flight.price.total).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
              <Users className="w-3 h-3" />
              {flight.numberOfBookableSeats} seats left
            </p>
          </div>
          {onSave && (
            <button onClick={onSave} className="btn-secondary text-xs px-3 py-1.5">
              Save
            </button>
          )}
        </div>
      </div>

      {/* Carrier */}
      {flight.validatingAirlineCodes && (
        <p className="mt-3 text-xs text-slate-400 border-t pt-3">
          Operated by {flight.validatingAirlineCodes}
        </p>
      )}
    </div>
  )
})
