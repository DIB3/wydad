import api from './api'

const auditLogService = {
  async getAll() {
    const response = await api.get('/audit_log')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/audit_log/${id}`)
    return response.data
  },

  // Fonctions utilitaires
  async getByActor(actorId) {
    const logs = await this.getAll()
    return logs.filter(log => log.actor_id === actorId)
  },

  async getByModule(module) {
    const logs = await this.getAll()
    return logs.filter(log => log.module === module)
  },

  async getByEntity(entity, entityId) {
    const logs = await this.getAll()
    return logs.filter(log => log.entity === entity && log.entity_id === entityId)
  },

  async getRecent(limit = 50) {
    const logs = await this.getAll()
    return logs
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
      .slice(0, limit)
  },

  async getByDateRange(startDate, endDate) {
    const logs = await this.getAll()
    return logs.filter(log => {
      const logDate = new Date(log.occurred_at)
      return logDate >= new Date(startDate) && logDate <= new Date(endDate)
    })
  },

  async getByAction(action) {
    const logs = await this.getAll()
    return logs.filter(log => log.action === action)
  }
}

export default auditLogService
