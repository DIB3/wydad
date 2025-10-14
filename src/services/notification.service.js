import api from './api'

const notificationService = {
  // Créer une notification
  async create(notificationData) {
    const response = await api.post('/notifications', notificationData)
    return response.data
  },

  // Récupérer toutes les notifications d'un utilisateur
  async getByUserId(userId) {
    const response = await api.get(`/notifications/user/${userId}`)
    return response.data
  },

  // Récupérer les notifications non lues
  async getUnreadByUserId(userId) {
    const response = await api.get(`/notifications/user/${userId}/unread`)
    return response.data
  },

  // Compter les notifications non lues
  async countUnreadByUserId(userId) {
    const response = await api.get(`/notifications/user/${userId}/unread/count`)
    return response.data.count
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId) {
    const response = await api.patch(`/notifications/user/${userId}/read-all`)
    return response.data
  },

  // Supprimer une notification
  async delete(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  },

  // Supprimer toutes les notifications lues
  async deleteAllRead(userId) {
    const response = await api.delete(`/notifications/user/${userId}/read`)
    return response.data
  }
}

export default notificationService

