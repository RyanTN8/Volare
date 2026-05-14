import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FlightResults from './pages/FlightResults'
import RestaurantResults from './pages/RestaurantResults'
import RestaurantDetail from './pages/RestaurantDetail'
import ItineraryView from './pages/ItineraryView'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/flights" element={<FlightResults />} />
        <Route path="/restaurants" element={<RestaurantResults />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/itinerary" element={<ItineraryView />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
