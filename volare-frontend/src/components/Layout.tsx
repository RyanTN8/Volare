import { Outlet, NavLink } from 'react-router-dom'
import { Plane, UtensilsCrossed, Map, User } from 'lucide-react'
import clsx from 'clsx'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-xl text-brand-600">
            <Plane className="w-6 h-6" />
            Volare
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavItem to="/flights" icon={<Plane className="w-4 h-4" />} label="Flights" />
            <NavItem to="/restaurants" icon={<UtensilsCrossed className="w-4 h-4" />} label="Restaurants" />
            <NavItem to="/itinerary" icon={<Map className="w-4 h-4" />} label="Plan Trip" />
            <NavItem to="/profile" icon={<User className="w-4 h-4" />} label="Profile" />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Volare — AI-powered travel, built with love
      </footer>
    </div>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
