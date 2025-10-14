import api from './api'

const reportService = {
  // Statistiques globales ou par joueur
  async getStats(playerId = null, startDate = null, endDate = null) {
    const params = {}
    if (playerId) params.player_id = playerId
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    
    const response = await api.get('/reports/stats', { params })
    return response.data
  },

  // Évolution des visites (graphique)
  async getVisitsEvolution(playerId = null, months = 6) {
    const params = { months }
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/visits-evolution', { params })
    return response.data
  },

  // Distribution des visites par module
  async getVisitsByModule(playerId = null, startDate = null, endDate = null) {
    const params = {}
    if (playerId) params.player_id = playerId
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    
    const response = await api.get('/reports/visits-by-module', { params })
    return response.data
  },

  // Distribution des statuts (certificats)
  async getStatusDistribution(playerId = null) {
    const params = {}
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/status-distribution', { params })
    return response.data
  },

  // Évolution des blessures
  async getInjuriesEvolution(playerId = null, months = 6) {
    const params = { months }
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/injuries-evolution', { params })
    return response.data
  },

  // Données d'impédance (moyenne tous joueurs ou joueur spécifique)
  async getImpedanceData(playerId = null, months = 6) {
    const params = { months }
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/impedance', { params })
    return response.data
  },

  // Données GPS (moyenne tous joueurs ou joueur spécifique)
  async getGPSData(playerId = null, weeks = 8) {
    const params = { weeks }
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/gps', { params })
    return response.data
  },

  // Rapport complet
  async getCompleteReport(playerId = null, startDate = null, endDate = null) {
    const params = {}
    if (playerId) params.player_id = playerId
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    
    const response = await api.get('/reports/complete', { params })
    return response.data
  },

  // IMC moyen par mois
  async getAverageIMC(playerId = null, months = 6) {
    const params = { months }
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/average-imc', { params })
    return response.data
  },

  // Performance radar (5 métriques)
  async getPerformanceRadar(playerId = null) {
    const params = {}
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/performance-radar', { params })
    return response.data
  },

  // Certificats expirants par période
  async getCertificatesExpiry(playerId = null) {
    const params = {}
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/certificates-expiry', { params })
    return response.data
  },

  // Visites récentes
  async getRecentVisits(playerId = null, limit = 5) {
    const params = { limit }
    if (playerId) params.player_id = playerId
    
    const response = await api.get('/reports/recent-visits', { params })
    return response.data
  }
}

export default reportService

