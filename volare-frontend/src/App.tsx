import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'))
const ItineraryView    = lazy(() => import('./pages/ItineraryView'))
const Profile          = lazy(() => import('./pages/Profile'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/restaurants/:id" element={<Suspense fallback={<PageLoader />}><RestaurantDetail /></Suspense>} />
        <Route path="/itinerary"       element={<Suspense fallback={<PageLoader />}><ItineraryView /></Suspense>} />
        <Route path="/profile"         element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
      </Route>
    </Routes>
  )
}
