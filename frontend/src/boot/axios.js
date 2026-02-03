import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ 
  baseURL: 'http://127.0.0.1:8000/',
  withCredentials: true, 
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const token = auth.token || localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const auth = useAuthStore()
      return auth
        .refresh()
        .then((data) => {
          if (data && data.access_token) {
            // update header and retry
            api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
            originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`
            return api(originalRequest)
          }
          // fallthrough to logout
          localStorage.removeItem('token')
          try { window.location.href = '/'; } catch (e) { console.log(e) }
          return Promise.reject(error)
        })
        .catch((e) => {
          // refresh failed — clear tokens and redirect
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          try { window.location.href = '/'; } catch (er) { console.log(er) }
          return Promise.reject(e)
        })
    }
    if (!error.response) {
      console.error('Network or CORS error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default defineBoot(({ app }) => {
  const auth = useAuthStore()
  const token = localStorage.getItem('token')
  if (token && !auth.token) {
    // initialize store and api header
    auth.setToken(token)
  }

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  
})

export { api }
