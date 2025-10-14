import api from './api'

const visitService = {
  async getAll() {
    const response = await api.get('/visits')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/visits/${id}`)
    return response.data
  },

  async create(visitData) {
    const response = await api.post('/visits', visitData)
    return response.data
  },

  async update(id, visitData) {
    const response = await api.put(`/visits/${id}`, visitData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/visits/${id}`)
    return response.data
  },

  async validate(id) {
    const response = await api.post(`/visits/${id}/validate`)
    return response.data
  },

  // Module specific endpoints
  async createPCMA(visitId, data) {
    const response = await api.post(`/visit_pcma/${visitId}`, data)
    return response.data
  },

  async createImpedance(visitId, data) {
    const response = await api.post(`/visit_impedance/${visitId}`, data)
    return response.data
  },

  async createGPS(visitId, data) {
    const response = await api.post(`/visit_gps/${visitId}`, data)
    return response.data
  },

  async createInjuries(visitId, data) {
    const response = await api.post(`/visit_injuries/${visitId}`, data)
    return response.data
  },

  async createNutrition(visitId, data) {
    const response = await api.post(`/visit_nutrition/${visitId}`, data)
    return response.data
  },
}

export default visitService

