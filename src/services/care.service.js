import api from './api'

const careService = {
  async create(visitId, careData) {
    const response = await api.post('/visit_care', {
      visit_id: visitId,
      ...careData
    })
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_care/${visitId}`)
    return response.data
  },

  async update(visitId, careData) {
    const response = await api.put(`/visit_care/${visitId}`, careData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_care/${visitId}`)
    return response.data
  },

  async getAll() {
    const response = await api.get('/visit_care')
    return response.data
  },

  async getByPlayerId(playerId) {
    const response = await api.get(`/visit_care/player/${playerId}`)
    return response.data
  }
}

export default careService

