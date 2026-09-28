import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Compass, Menu, Plane } from 'lucide-react'
import clsx from 'clsx'
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
          <nav className="flex items-center gap-1.5">
            {hasPlan && <NavItem to="/itinerary" label="Plan Trip" />}
            {isItineraryPage && (
              <NavLink
                to="/"
                end
                className={({ isActive }) => clsx(
                  'hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-[#173c35] text-white'
                    : 'text-stone-600 hover:text-[#173c35] hover:bg-[#eae4da]'
                )}
              >
                <Compass className="w-3.5 h-3.5" /> Explore
              </NavLink>
            )}
            <Menu className="sm:hidden w-5 h-5 text-[#173c35]" />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          // Keep the same font weight in every state so activating the link
          // does not change its measured width and nudge the nav.
          'px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
          isActive
            ? 'text-[#173c35] bg-[#e4ded2]'
            : 'text-stone-600 hover:text-[#173c35] hover:bg-[#eae4da]'
        )
      }
    >
      {label}
    </NavLink>
  )
}
