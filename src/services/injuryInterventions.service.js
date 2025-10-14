import api from './api'

const injuryInterventionsService = {
  async create(interventionData) {
    const response = await api.post('/injury_interventions', interventionData)
    return response.data
  },

  async getByInjuryId(injuryId) {
    const response = await api.get(`/injury_interventions/${injuryId}`)
    return response.data
  },

  async update(injuryId, interventionData) {
    const response = await api.put(`/injury_interventions/${injuryId}`, interventionData)
    return response.data
  },

  async delete(injuryId) {
    const response = await api.delete(`/injury_interventions/${injuryId}`)
    return response.data
  },

  // Fonctions utilitaires
  async getAll() {
    // Note: Cette fonction nécessiterait un endpoint GET /injury_interventions
    // Pour l'instant, on utilise les visites pour récupérer les interventions
    const response = await api.get('/visits')
    const visits = response.data
    const injuryVisits = visits.filter(visit => visit.module === 'injury')
    
    const interventionData = []
    for (const visit of injuryVisits) {
      try {
        const intervention = await this.getByInjuryId(visit.id)
        interventionData.push(intervention)
      } catch (error) {
        // Blessure sans intervention, on ignore
      }
    }
    
    return interventionData
  },

  async getByPlayerId(playerId) {
    const response = await api.get('/visits')
    const visits = response.data.filter(visit => 
      visit.player_id === playerId && visit.module === 'injury'
    )
    
    const interventionData = []
    for (const visit of visits) {
      try {
        const intervention = await this.getByInjuryId(visit.id)
        interventionData.push({ ...intervention, visit })
      } catch (error) {
        // Blessure sans intervention, on ignore
      }
    }
    
    return interventionData
  },

  // Fonctions de calcul
  calculateDaysSinceIntervention(interventionDate) {
    if (!interventionDate) return null
    const intervention = new Date(interventionDate)
    const today = new Date()
    const diffTime = Math.abs(today - intervention)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  // Fonctions d'évaluation
  getInterventionTypeCategory(interventionType) {
    if (!interventionType) return 'Inconnu'
    const typeMap = {
      'medicament': 'Médicament',
      'physiotherapie': 'Physiothérapie',
      'chirurgie': 'Chirurgie',
      'infiltration': 'Infiltration',
      'massage': 'Massage',
      'electrostimulation': 'Électrostimulation',
      'cryotherapie': 'Cryothérapie',
      'thermotherapie': 'Thermothérapie',
      'bandage': 'Bandage',
      'attelle': 'Attelle',
      'repos': 'Repos',
      'reeducation': 'Rééducation'
    }
    return typeMap[interventionType] || interventionType
  },

  getInterventionPriorityCategory(interventionType) {
    if (!interventionType) return 'Inconnu'
    const priorityMap = {
      'medicament': 'Standard',
      'physiotherapie': 'Standard',
      'chirurgie': 'Urgent',
      'infiltration': 'Urgent',
      'massage': 'Standard',
      'electrostimulation': 'Standard',
      'cryotherapie': 'Standard',
      'thermotherapie': 'Standard',
      'bandage': 'Standard',
      'attelle': 'Standard',
      'repos': 'Standard',
      'reeducation': 'Standard'
    }
    return priorityMap[interventionType] || 'Standard'
  },

  // Fonctions de statistiques
  async getInterventionStats() {
    const interventions = await this.getAll()
    if (interventions.length === 0) return null

    const stats = {
      totalInterventions: interventions.length,
      byType: {},
      byMonth: {},
      avgDaysSinceIntervention: 0,
      mostCommonType: null,
      recentInterventions: []
    }

    // Analyser par type
    interventions.forEach(intervention => {
      if (intervention.intervention_type) {
        stats.byType[intervention.intervention_type] = (stats.byType[intervention.intervention_type] || 0) + 1
      }
    })

    // Analyser par mois
    interventions.forEach(intervention => {
      if (intervention.intervention_date) {
        const month = new Date(intervention.intervention_date).toISOString().substring(0, 7)
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1
      }
    })

    // Calculer la moyenne des jours depuis l'intervention
    const daysSinceInterventions = interventions
      .map(intervention => this.calculateDaysSinceIntervention(intervention.intervention_date))
      .filter(days => days !== null)
    
    if (daysSinceInterventions.length > 0) {
      stats.avgDaysSinceIntervention = daysSinceInterventions.reduce((sum, days) => sum + days, 0) / daysSinceInterventions.length
    }

    // Trouver le type le plus commun
    stats.mostCommonType = Object.keys(stats.byType).reduce((a, b) => 
      stats.byType[a] > stats.byType[b] ? a : b, null
    )

    // Interventions récentes (30 derniers jours)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    stats.recentInterventions = interventions.filter(intervention => {
      if (!intervention.intervention_date) return false
      return new Date(intervention.intervention_date) >= thirtyDaysAgo
    })

    return stats
  },

  async getPlayerInterventionStats(playerId) {
    const interventions = await this.getByPlayerId(playerId)
    if (interventions.length === 0) return null

    const stats = {
      totalInterventions: interventions.length,
      byType: {},
      avgDaysSinceIntervention: 0,
      mostRecentIntervention: null,
      upcomingInterventions: []
    }

    // Analyser par type
    interventions.forEach(intervention => {
      if (intervention.intervention_type) {
        stats.byType[intervention.intervention_type] = (stats.byType[intervention.intervention_type] || 0) + 1
      }
    })

    // Calculer la moyenne des jours depuis l'intervention
    const daysSinceInterventions = interventions
      .map(intervention => this.calculateDaysSinceIntervention(intervention.intervention_date))
      .filter(days => days !== null)
    
    if (daysSinceInterventions.length > 0) {
      stats.avgDaysSinceIntervention = daysSinceInterventions.reduce((sum, days) => sum + days, 0) / daysSinceInterventions.length
    }

    // Trouver l'intervention la plus récente
    if (interventions.length > 0) {
      stats.mostRecentIntervention = interventions
        .filter(intervention => intervention.intervention_date)
        .sort((a, b) => new Date(b.intervention_date) - new Date(a.intervention_date))[0]
    }

    return stats
  }
}

export default injuryInterventionsService
