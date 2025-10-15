import api from './api'

const soinsService = {
  async create(visitId, soinData) {
    const payload = {
      visit_id: visitId,
      ...soinData
    }
    const response = await api.post('/visit_soins', payload)
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_soins/${visitId}`)
    return response.data
  },

  async update(visitId, soinData) {
    const response = await api.put(`/visit_soins/${visitId}`, soinData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_soins/${visitId}`)
    return response.data
  },

  async getAll() {
    const response = await api.get('/visit_soins')
    return response.data
  },

  async getByPlayerId(playerId) {
    const response = await api.get(`/visit_soins/player/${playerId}`)
    return response.data
  },

  async getByBlessureId(blessureId) {
    const response = await api.get(`/visit_soins/blessure/${blessureId}`)
    return response.data
  }
}

export default soinsService

