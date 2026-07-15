import { Outlet, NavLink } from 'react-router-dom'
import { Plane } from 'lucide-react'
import clsx from 'clsx'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-900 flex items-center justify-center flex-shrink-0">
              <Plane className="w-3.5 h-3.5 text-brand-300 rotate-45" />
            </div>
            <span className="font-display font-800 text-slate-900 tracking-tight text-[15px]">Volare</span>
          </NavLink>
          <nav className="flex items-center gap-0.5">
            <NavItem to="/flights"     label="Flights" />
            <NavItem to="/restaurants" label="Restaurants" />
            <NavItem to="/itinerary"   label="Plan Trip" />
            <NavItem to="/profile"     label="Profile" />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-100 py-5 text-center text-xs text-slate-400 tracking-wide bg-white">
        © {new Date().getFullYear()} Volare
      </footer>
    </div>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'px-3 py-1.5 rounded-md text-sm transition-colors',
          isActive
            ? 'text-slate-900 font-semibold bg-slate-100'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
        )
      }
    >
      {label}
    </NavLink>
  )
}
