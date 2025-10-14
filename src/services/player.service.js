import api from './api'

const playerService = {
  async getAll() {
    const response = await api.get('/players')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/players/${id}`)
    return response.data
  },

  async create(playerData) {
    const response = await api.post('/players', playerData)
    return response.data
  },

  async update(id, playerData) {
    const response = await api.put(`/players/${id}`, playerData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/players/${id}`)
    return response.data
  },
}

export default playerService

