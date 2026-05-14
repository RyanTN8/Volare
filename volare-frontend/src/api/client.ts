import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

client.interceptors.response.use(
  res => res,
  err => {
    const detail = err.response?.data?.detail ?? err.message
    return Promise.reject(new Error(detail))
  }
)

export default client
