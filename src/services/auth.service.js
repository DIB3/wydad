import api from './api'

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      
      // Décoder le token JWT pour extraire les infos utilisateur (maintenant avec first_name et last_name)
      const tokenPayload = JSON.parse(atob(response.data.token.split('.')[1]))
      const user = {
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
        first_name: tokenPayload.first_name || '',
        last_name: tokenPayload.last_name || '',
      }
      localStorage.setItem('user', JSON.stringify(user))
      
      return { token: response.data.token, user }
    }
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) return JSON.parse(userStr)
    return null
  },

  getToken() {
    return localStorage.getItem('token')
  },

  isAuthenticated() {
    return !!this.getToken()
  },
}

export default authService

