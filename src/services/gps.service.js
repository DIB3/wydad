import api from './api'

const gpsService = {
  async create(visitId, gpsData) {
    const response = await api.post('/visit_gps', {
      visit_id: visitId,
      ...gpsData
    })
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_gps/${visitId}`)
    return response.data
  },

  async update(visitId, gpsData) {
    const response = await api.put(`/visit_gps/${visitId}`, gpsData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_gps/${visitId}`)
    return response.data
  },

  // Fonctions utilitaires
  async getAll() {
    const response = await api.get('/visits')
    const visits = response.data
    const gpsVisits = visits.filter(visit => visit.module === 'gps')
    
    const gpsData = []
    for (const visit of gpsVisits) {
      try {
        const gps = await this.getByVisitId(visit.id)
        gpsData.push(gps)
      } catch (error) {
        console.warn(`GPS non trouvé pour la visite ${visit.id}`)
      }
    }
    
    return gpsData
  },

  async getByPlayerId(playerId) {
    const response = await api.get('/visits')
    
    const visits = response.data.filter(visit => 
      visit.player_id === playerId && visit.module === 'gps'
    )
    
    const gpsData = []
    for (const visit of visits) {
      try {
        const gps = await this.getByVisitId(visit.id)
        gpsData.push({ ...gps, visit })
      } catch (error) {
      }
    }
    
    return gpsData
  },

  // Fonctions de calcul
  calculateDistanceKm(distanceM) {
    if (!distanceM) return null
    return (distanceM / 1000).toFixed(2)
  },

  calculateSpeedKmh(distanceM, durationMin) {
    if (!distanceM || !durationMin) return null
    const distanceKm = distanceM / 1000
    const durationH = durationMin / 60
    return (distanceKm / durationH).toFixed(2)
  },

  calculatePlayerLoadPerMin(playerLoad, durationMin) {
    if (!playerLoad || !durationMin) return null
    return (playerLoad / durationMin).toFixed(2)
  },

  calculateSprintsPerMin(sprintsCount, durationMin) {
    if (!sprintsCount || !durationMin) return null
    return (sprintsCount / durationMin).toFixed(2)
  },

  calculateAccelerationsPerMin(accCount, durationMin) {
    if (!accCount || !durationMin) return null
    return (accCount / durationMin).toFixed(2)
  },

  calculateDecelerationsPerMin(decelCount, durationMin) {
    if (!decelCount || !durationMin) return null
    return (decelCount / durationMin).toFixed(2)
  },

  // Fonctions d'évaluation
  getDistanceCategory(distanceKm) {
    if (!distanceKm) return 'Inconnu'
    if (distanceKm < 5) return 'Faible'
    if (distanceKm < 10) return 'Modéré'
    if (distanceKm < 15) return 'Élevé'
    return 'Très élevé'
  },

  getSpeedCategory(avgSpeedKmh) {
    if (!avgSpeedKmh) return 'Inconnu'
    if (avgSpeedKmh < 5) return 'Lent'
    if (avgSpeedKmh < 10) return 'Modéré'
    if (avgSpeedKmh < 15) return 'Rapide'
    return 'Très rapide'
  },

  getPlayerLoadCategory(playerLoad) {
    if (!playerLoad) return 'Inconnu'
    if (playerLoad < 200) return 'Faible'
    if (playerLoad < 400) return 'Modéré'
    if (playerLoad < 600) return 'Élevé'
    return 'Très élevé'
  },

  getSprintsCategory(sprintsCount) {
    if (!sprintsCount) return 'Inconnu'
    if (sprintsCount < 5) return 'Faible'
    if (sprintsCount < 15) return 'Modéré'
    if (sprintsCount < 25) return 'Élevé'
    return 'Très élevé'
  },

  getRecoveryCategory(recoveryIndex) {
    if (!recoveryIndex) return 'Inconnu'
    if (recoveryIndex < 0.3) return 'Faible'
    if (recoveryIndex < 0.6) return 'Modéré'
    if (recoveryIndex < 0.8) return 'Bon'
    return 'Excellent'
  },

  // Fonctions de statistiques
  async getPlayerStats(playerId) {
    const gpsData = await this.getByPlayerId(playerId)
    if (gpsData.length === 0) return null

    const stats = {
      totalSessions: gpsData.length,
      totalDistance: gpsData.reduce((sum, gps) => sum + (gps.distance_m || 0), 0),
      totalDuration: gpsData.reduce((sum, gps) => sum + (gps.duration_min || 0), 0),
      totalSprints: gpsData.reduce((sum, gps) => sum + (gps.sprints_count || 0), 0),
      totalPlayerLoad: gpsData.reduce((sum, gps) => sum + (gps.player_load || 0), 0),
      avgSpeed: 0,
      maxSpeed: Math.max(...gpsData.map(gps => gps.vmax_kmh || 0)),
      avgPlayerLoad: 0,
      avgRecovery: 0
    }

    if (stats.totalDuration > 0) {
      stats.avgSpeed = (stats.totalDistance / 1000) / (stats.totalDuration / 60)
    }

    if (stats.totalSessions > 0) {
      stats.avgPlayerLoad = stats.totalPlayerLoad / stats.totalSessions
      stats.avgRecovery = gpsData.reduce((sum, gps) => sum + (gps.recovery_index || 0), 0) / stats.totalSessions
    }

    return stats
  }
}

export default gpsService
