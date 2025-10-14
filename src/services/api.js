import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://omnidocteur.ma/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Masquer les erreurs 404 dans la console pour les endpoints de visites
    // Ces erreurs sont normales car toutes les visites n'ont pas forcément des données pour tous les modules
    const silentEndpoints = ['/visit_pcma/', '/visit_gps/', '/visit_impedance/', '/visit_nutrition/', '/visit_injuries/', '/certificates']
    const isSilentEndpoint = silentEndpoints.some(endpoint => error.config?.url?.includes(endpoint))
    
    if (error.response?.status === 404 && isSilentEndpoint) {
      // Supprimer le log d'erreur de la console pour ces endpoints
      error.silent = true
    }
    
    return Promise.reject(error)
  }
)

export default api

