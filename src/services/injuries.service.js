import api from './api'

const injuriesService = {
  async create(visitId, injuryData) {
    const response = await api.post('/visit_injuries', {
      visit_id: visitId,
      ...injuryData
    })
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_injuries/${visitId}`)
    return response.data
  },

  async update(visitId, injuryData) {
    const response = await api.put(`/visit_injuries/${visitId}`, injuryData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_injuries/${visitId}`)
    return response.data
  },

  // Fonctions utilitaires
  async getAll() {
    const response = await api.get('/visits')
    const visits = response.data
    const injuryVisits = visits.filter(visit => visit.module === 'injury')
    
    const injuryData = []
    for (const visit of injuryVisits) {
      try {
        const injury = await this.getByVisitId(visit.id)
        injuryData.push(injury)
      } catch (error) {
        // Visite sans blessure, on ignore
      }
    }
    
    return injuryData
  },

  async getByPlayerId(playerId) {
    const response = await api.get('/visits')
    
    const visits = response.data.filter(visit => 
      visit.player_id === playerId && visit.module === 'injury'
    )
    
    const injuryData = []
    for (const visit of visits) {
      try {
        const injury = await this.getByVisitId(visit.id)
        injuryData.push({ ...injury, visit })
      } catch (error) {
      }
    }
    
    return injuryData
  },

  // Fonctions de calcul
  calculateInjuryDuration(injuryDate, returnDate) {
    if (!injuryDate || !returnDate) return null
    const start = new Date(injuryDate)
    const end = new Date(returnDate)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  calculateDaysSinceInjury(injuryDate) {
    if (!injuryDate) return null
    const injury = new Date(injuryDate)
    const today = new Date()
    const diffTime = Math.abs(today - injury)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  calculateDaysUntilReturn(returnDate) {
    if (!returnDate) return null
    const returnD = new Date(returnDate)
    const today = new Date()
    const diffTime = returnD - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  // Fonctions d'évaluation
  getSeverityCategory(severity) {
    if (!severity) return 'Inconnu'
    const severityMap = {
      'legere': 'Légère',
      'moderee': 'Modérée',
      'severe': 'Sévère'
    }
    return severityMap[severity] || severity
  },

  getRecoveryStatusCategory(recoveryStatus) {
    if (!recoveryStatus) return 'Inconnu'
    const statusMap = {
      'en_cours': 'En cours',
      'reeducation': 'Rééducation',
      'retour_partiel': 'Retour partiel',
      'retour_complet': 'Retour complet'
    }
    return statusMap[recoveryStatus] || recoveryStatus
  },

  getPainLevelCategory(painLevel) {
    if (painLevel === null || painLevel === undefined) return 'Inconnu'
    if (painLevel <= 2) return 'Très faible'
    if (painLevel <= 4) return 'Faible'
    if (painLevel <= 6) return 'Modéré'
    if (painLevel <= 8) return 'Élevé'
    return 'Très élevé'
  },

  getInjuryTypeCategory(type) {
    if (!type) return 'Inconnu'
    const typeMap = {
      'musculaire': 'Musculaire',
      'tendineuse': 'Tendineuse',
      'articulaire': 'Articulaire',
      'osseuse': 'Osseuse',
      'ligamentaire': 'Ligamentaire'
    }
    return typeMap[type] || type
  },

  getLocationCategory(location) {
    if (!location) return 'Inconnu'
    const locationMap = {
      'tete': 'Tête',
      'cou': 'Cou',
      'epaule': 'Épaule',
      'bras': 'Bras',
      'coude': 'Coude',
      'avant_bras': 'Avant-bras',
      'poignet': 'Poignet',
      'main': 'Main',
      'thorax': 'Thorax',
      'abdomen': 'Abdomen',
      'dos': 'Dos',
      'lombes': 'Lombes',
      'hanche': 'Hanche',
      'cuisse': 'Cuisse',
      'genou': 'Genou',
      'jambe': 'Jambe',
      'cheville': 'Cheville',
      'pied': 'Pied'
    }
    return locationMap[location] || location
  },

  // Fonctions de statistiques
  async getPlayerInjuryStats(playerId) {
    const injuries = await this.getByPlayerId(playerId)
    if (injuries.length === 0) return null

    const stats = {
      totalInjuries: injuries.length,
      activeInjuries: injuries.filter(injury => 
        injury.recovery_status === 'en_cours' || 
        injury.recovery_status === 'reeducation'
      ).length,
      totalDaysLost: 0,
      avgInjuryDuration: 0,
      mostCommonType: null,
      mostCommonLocation: null,
      severityDistribution: {
        legere: 0,
        moderee: 0,
        severe: 0
      }
    }

    // Calculer les jours perdus
    injuries.forEach(injury => {
      if (injury.injury_date && injury.return_actual) {
        const duration = this.calculateInjuryDuration(injury.injury_date, injury.return_actual)
        if (duration) stats.totalDaysLost += duration
      }
    })

    // Calculer la durée moyenne
    if (stats.totalInjuries > 0) {
      stats.avgInjuryDuration = stats.totalDaysLost / stats.totalInjuries
    }

    // Analyser les types et localisations
    const typeCount = {}
    const locationCount = {}
    
    injuries.forEach(injury => {
      if (injury.type) {
        typeCount[injury.type] = (typeCount[injury.type] || 0) + 1
      }
      if (injury.location) {
        locationCount[injury.location] = (locationCount[injury.location] || 0) + 1
      }
      if (injury.severity) {
        stats.severityDistribution[injury.severity]++
      }
    })

    // Trouver les plus communs
    stats.mostCommonType = Object.keys(typeCount).reduce((a, b) => 
      typeCount[a] > typeCount[b] ? a : b, null
    )
    stats.mostCommonLocation = Object.keys(locationCount).reduce((a, b) => 
      locationCount[a] > locationCount[b] ? a : b, null
    )

    return stats
  },

  async getInjuryTrends() {
    const injuries = await this.getAll()
    if (injuries.length === 0) return null

    const trends = {
      totalInjuries: injuries.length,
      byMonth: {},
      byType: {},
      bySeverity: {},
      byLocation: {},
      avgDuration: 0
    }

    // Analyser par mois
    injuries.forEach(injury => {
      if (injury.injury_date) {
        const month = new Date(injury.injury_date).toISOString().substring(0, 7)
        trends.byMonth[month] = (trends.byMonth[month] || 0) + 1
      }
    })

    // Analyser par type, gravité et localisation
    injuries.forEach(injury => {
      if (injury.type) {
        trends.byType[injury.type] = (trends.byType[injury.type] || 0) + 1
      }
      if (injury.severity) {
        trends.bySeverity[injury.severity] = (trends.bySeverity[injury.severity] || 0) + 1
      }
      if (injury.location) {
        trends.byLocation[injury.location] = (trends.byLocation[injury.location] || 0) + 1
      }
    })

    return trends
  }
}

export default injuriesService
