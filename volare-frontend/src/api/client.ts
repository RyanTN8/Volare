import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  // 2 min: AI itinerary generation runs 10-15s, and a cold Render free-tier
  // backend can add ~50s of wake-up time on the first request.
  timeout: 120_000,
})

client.interceptors.response.use(
  res => res,
  err => {
    const detail = err.response?.data?.detail ?? err.message
    return Promise.reject(new Error(detail))
  }
)

export default client
