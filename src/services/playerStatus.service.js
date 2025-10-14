import api from './api'

const playerStatusService = {
  async create(statusData) {
    const response = await api.post('/player_status_history', statusData)
    return response.data
  },

  async getAll() {
    const response = await api.get('/player_status_history')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/player_status_history/${id}`)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/player_status_history/${id}`)
    return response.data
  },

  // Fonctions utilitaires
  async getByPlayerId(playerId) {
    const statuses = await this.getAll()
    return statuses.filter(status => status.player_id === playerId)
  },

  async getCurrentStatus(playerId) {
    const statuses = await this.getByPlayerId(playerId)
    if (statuses.length === 0) return null
    
    // Retourner le statut le plus récent
    return statuses.sort((a, b) => new Date(b.from_date) - new Date(a.from_date))[0]
  },

  async getStatusHistory(playerId) {
    const statuses = await this.getByPlayerId(playerId)
    return statuses.sort((a, b) => new Date(b.from_date) - new Date(a.from_date))
  },

  async updatePlayerStatus(playerId, newStatus, reason, sourceCertificateId) {
    const currentStatus = await this.getCurrentStatus(playerId)
    
    // Mettre à jour le statut actuel si il existe
    if (currentStatus && !currentStatus.to_date) {
      await this.update(currentStatus.id, {
        to_date: new Date().toISOString().split('T')[0]
      })
    }

    // Créer le nouveau statut
    return await this.create({
      player_id: playerId,
      status: newStatus,
      from_date: new Date().toISOString().split('T')[0],
      reason: reason,
      source_certificate_id: sourceCertificateId
    })
  }
}

export default playerStatusService
