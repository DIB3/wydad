import api from './api'

const userService = {
  async getAll() {
    const response = await api.get('/users')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async update(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Fonctions utilitaires
  async getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return await this.getById(user.id)
    }
    return null
  },

  async updateProfile(userData) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return await this.update(user.id, userData)
    }
    throw new Error('Utilisateur non connecté')
  }
}

export default userService
