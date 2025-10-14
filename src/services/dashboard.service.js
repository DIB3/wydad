import api from './api'
import playerService from './player.service'
import visitService from './visit.service'
import certificateService from './certificate.service'

const dashboardService = {
  /**
   * Récupérer toutes les statistiques du dashboard
   */
  async getStats() {
    try {
      const [players, visits, certificates] = await Promise.all([
        playerService.getAll(),
        visitService.getAll(),
        certificateService.getAll()
      ])

      // Calculer les statistiques
      const stats = {
        // Nombre total de joueurs actifs
        activePlayers: players.length,
        
        // Visites ce mois
        visitsThisMonth: this.countVisitsThisMonth(visits),
        visitsLastMonth: this.countVisitsLastMonth(visits),
        
        // Certificats à renouveler
        certificatesToRenew: this.countCertificatesToRenew(certificates),
        
        // Taux d'aptitude
        fitnessRate: this.calculateFitnessRate(players),
        
        // Distribution des statuts
        statusDistribution: this.calculateStatusDistribution(players),
        
        // Évolution des visites (6 derniers mois)
        visitsEvolution: this.calculateVisitsEvolution(visits),
        
        // Visites récentes
        recentVisits: visits.slice(0, 5).sort((a, b) => 
          new Date(b.visit_date) - new Date(a.visit_date)
        ),
        
        // Statistiques médicales professionnelles
        medicalStats: this.calculateMedicalStats(visits, certificates, players)
      }

      return stats
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error)
      throw error
    }
  },

  /**
   * Compter les visites du mois en cours
   */
  countVisitsThisMonth(visits) {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    
    return visits.filter(visit => {
      const visitDate = new Date(visit.visit_date)
      return visitDate.getMonth() === thisMonth && visitDate.getFullYear() === thisYear
    }).length
  },

  /**
   * Compter les visites du mois dernier
   */
  countVisitsLastMonth(visits) {
    const now = new Date()
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    
    return visits.filter(visit => {
      const visitDate = new Date(visit.visit_date)
      return visitDate.getMonth() === lastMonth && visitDate.getFullYear() === lastMonthYear
    }).length
  },

  /**
   * Compter les certificats à renouveler dans les 30 jours
   */
  countCertificatesToRenew(certificates) {
    const now = new Date()
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    return certificates.filter(cert => {
      if (!cert.validity_end) return false
      const validityEnd = new Date(cert.validity_end)
      return validityEnd >= now && validityEnd <= in30Days
    }).length
  },

  /**
   * Calculer le taux d'aptitude
   */
  calculateFitnessRate(players) {
    if (players.length === 0) return 0
    
    const fitPlayers = players.filter(player => 
      player.status === 'APTE' || player.status === 'APTE_RESTRICTIONS'
    ).length
    
    return Math.round((fitPlayers / players.length) * 100)
  },

  /**
   * Calculer la distribution des statuts
   */
  calculateStatusDistribution(players) {
    const total = players.length
    if (total === 0) return []

    const statusCount = {
      APTE: 0,
      APTE_RESTRICTIONS: 0,
      TEMP_INAPTE: 0,
      INAPTE: 0
    }

    players.forEach(player => {
      if (Object.prototype.hasOwnProperty.call(statusCount, player.status)) {
        statusCount[player.status]++
      }
    })

    return [
      { 
        status: 'APTE', 
        count: statusCount.APTE, 
        percentage: Math.round((statusCount.APTE / total) * 100),
        emoji: '✅',
        color: 'text-green-600'
      },
      { 
        status: 'APTE_RESTRICTIONS', 
        count: statusCount.APTE_RESTRICTIONS, 
        percentage: Math.round((statusCount.APTE_RESTRICTIONS / total) * 100),
        emoji: '⚠️',
        color: 'text-yellow-600'
      },
      { 
        status: 'TEMP_INAPTE', 
        count: statusCount.TEMP_INAPTE, 
        percentage: Math.round((statusCount.TEMP_INAPTE / total) * 100),
        emoji: '🔸',
        color: 'text-orange-600'
      },
      { 
        status: 'INAPTE', 
        count: statusCount.INAPTE, 
        percentage: Math.round((statusCount.INAPTE / total) * 100),
        emoji: '❌',
        color: 'text-red-600'
      }
    ]
  },

  /**
   * Calculer l'évolution des visites sur les 6 derniers mois
   */
  calculateVisitsEvolution(visits) {
    const months = []
    const now = new Date()
    
    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        count: 0
      })
    }

    // Compter les visites par mois
    visits.forEach(visit => {
      const visitDate = new Date(visit.visit_date)
      const monthData = months.find(m => 
        m.monthIndex === visitDate.getMonth() && 
        m.year === visitDate.getFullYear()
      )
      if (monthData) {
        monthData.count++
      }
    })

    return months.map(m => ({
      month: m.month.charAt(0).toUpperCase() + m.month.slice(1),
      count: m.count
    }))
  },

  /**
   * Récupérer les joueurs avec le plus de visites
   */
  async getTopPlayers(limit = 5) {
    try {
      const [players, visits] = await Promise.all([
        playerService.getAll(),
        visitService.getAll()
      ])

      // Compter les visites par joueur
      const playerVisitCount = {}
      visits.forEach(visit => {
        playerVisitCount[visit.player_id] = (playerVisitCount[visit.player_id] || 0) + 1
      })

      // Trier les joueurs par nombre de visites
      const topPlayers = players
        .map(player => ({
          ...player,
          visitCount: playerVisitCount[player.id] || 0
        }))
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, limit)

      return topPlayers
    } catch (error) {
      console.error('Erreur lors de la récupération des top joueurs:', error)
      throw error
    }
  },

  /**
   * Récupérer les statistiques des modules
   */
  async getModuleStats() {
    try {
      const response = await api.get('/stats/modules')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des stats modules:', error)
      // Retourner des données par défaut en cas d'erreur
      return {
        pcma: 0,
        impedance: 0,
        gps: 0,
        injuries: 0,
        nutrition: 0
      }
    }
  },

  /**
   * Calculer les statistiques médicales professionnelles
   */
  calculateMedicalStats(visits, certificates, players) {
    // Compter les examens (PCMA)
    const examinations = visits.filter(v => v.module === 'PCMA').length

    // Compter les "vaccins" (certificats valides)
    const now = new Date()
    const validCertificates = certificates.filter(cert => {
      if (!cert.validity_end) return false
      const validityEnd = new Date(cert.validity_end)
      return validityEnd >= now
    }).length

    // Compter les analyses (Impédancemétrie + GPS)
    const analyses = visits.filter(v => 
      v.module === 'Impédancemétrie' || v.module === 'GPS'
    ).length

    // Certificats à renouveler (déjà calculé)
    const certificatesToRenew = this.countCertificatesToRenew(certificates)

    // Compter les blessures actives
    const activeInjuries = visits.filter(v => v.module === 'Blessures').length

    // Compter les consultations nutrition
    const nutritionConsultations = visits.filter(v => v.module === 'Nutrition').length

    // Compter les séances de soins
    const careSessionsCount = visits.filter(v => v.module === 'Soins').length

    return {
      examinations,        // Examens PCMA
      vaccinations: validCertificates,  // Certificats valides
      analyses,           // Impédance + GPS
      certificatesToRenew, // Certificats à renouveler
      activeInjuries,     // Blessures actives
      nutritionConsultations, // Consultations nutrition
      careSessions: careSessionsCount, // Séances de soins
      totalPatients: players.length // Total patients
    }
  }
}

export default dashboardService

