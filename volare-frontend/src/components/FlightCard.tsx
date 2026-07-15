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
  const first    = outbound?.segments[0]
  const last     = outbound?.segments[outbound.segments.length - 1]
  const stops    = outbound?.segments.length - 1

  return (
    <div className="card p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-4">

        {/* Route */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Departure */}
          <div className="text-center min-w-[56px]">
            <p className="font-display font-bold text-slate-900 text-xl tabular-nums leading-tight">
              {first?.departureIataCode}
            </p>
            <p className="text-xs text-slate-400 tabular-nums mt-0.5">{first ? formatTime(first.departureTime) : '—'}</p>
          </div>

          {/* Line */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {outbound ? formatDuration(outbound.duration) : '—'}
            </span>
            <div className="relative w-full flex items-center gap-1">
              <div className="h-px flex-1 bg-slate-200" />
              <Plane className="w-3.5 h-3.5 text-brand-600 rotate-90 flex-shrink-0" />
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <span className="text-[11px] text-slate-400">
              {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-center min-w-[56px]">
            <p className="font-display font-bold text-slate-900 text-xl tabular-nums leading-tight">
              {last?.arrivalIataCode}
            </p>
            <p className="text-xs text-slate-400 tabular-nums mt-0.5">{last ? formatTime(last.arrivalTime) : '—'}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0 pl-2 border-l border-slate-100">
          <div className="text-right">
            <p className="font-display font-bold text-2xl text-slate-900 tabular-nums leading-tight">
              {parseFloat(flight.price.total).toLocaleString()}
              <span className="text-sm font-sans font-medium text-slate-400 ml-1">{flight.price.currency}</span>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
              <Users className="w-3 h-3" />
              {flight.numberOfBookableSeats} left
            </p>
          </div>
          {onSave && (
            <button onClick={onSave} className="btn-secondary text-xs px-3 py-1.5">Save</button>
          )}
        </div>
      </div>

      {flight.validatingAirlineCodes && (
        <p className="mt-3 pt-3 text-[11px] text-slate-400 border-t border-slate-100">
          Operated by {flight.validatingAirlineCodes}
        </p>
      )}
    </div>
  )
})
