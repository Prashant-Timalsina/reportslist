import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ 
  baseURL: 'https://localhost:8000/',
  withCredentials:true, 
  headers:{
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
})

const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default defineBoot(({ app }) => {
  
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  
})

export { api }
