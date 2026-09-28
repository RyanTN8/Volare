import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Compass, Plane } from 'lucide-react'
import { useItineraryStore } from '../store/itineraryStore'

export default function Layout() {
  const hasPlan = useItineraryStore(state => state.plan !== null)
  const location = useLocation()
  const isItineraryPage = location.pathname === '/itinerary'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#f6f1e8] border-b border-stone-900/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#173c35] flex items-center justify-center flex-shrink-0">
              <Plane className="w-4 h-4 text-[#f6f1e8] rotate-45" />
            </div>
            <span className="font-display font-extrabold text-[#173c35] tracking-[-0.06em] text-xl">volare</span>
          </NavLink>
          <nav>
            {isItineraryPage && (
              <NavLink
                to="/"
                end
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold text-stone-600 hover:text-[#173c35] hover:bg-[#eae4da] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Explore destinations
              </NavLink>
            )}
            {!isItineraryPage && hasPlan && (
              <NavLink
                to="/itinerary"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold bg-[#173c35] text-white hover:bg-[#0f2d27] transition-colors"
              >
                <Compass className="w-3.5 h-3.5" /> View itinerary <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
