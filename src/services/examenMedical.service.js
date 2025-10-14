import api from './api'

const examenMedicalService = {
  async create(visitId, examenData) {
    const response = await api.post('/visit_examen_medical', {
      visit_id: visitId,
      ...examenData
    })
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_examen_medical/${visitId}`)
    return response.data
  },

  async update(visitId, examenData) {
    const response = await api.put(`/visit_examen_medical/${visitId}`, examenData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_examen_medical/${visitId}`)
    return response.data
  },

  async getAll() {
    const response = await api.get('/visit_examen_medical')
    return response.data
  },

  async getByPlayerId(playerId) {
    const response = await api.get(`/visit_examen_medical/player/${playerId}`)
    return response.data
  }
}

export default examenMedicalService

