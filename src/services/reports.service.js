import dashboardService from './dashboard.service'
import playerService from './player.service'
import visitService from './visit.service'
import certificateService from './certificate.service'
import pcmaService from './pcma.service'
import impedanceService from './impedance.service'
import gpsService from './gps.service'
import injuriesService from './injuries.service'
import nutritionService from './nutrition.service'

const reportsService = {
  /**
   * Récupérer toutes les données pour les rapports
   */
  async getAllReportsData() {
    try {
      const [players, visits, certificates, stats] = await Promise.all([
        playerService.getAll(),
        visitService.getAll(),
        certificateService.getAll(),
        dashboardService.getStats()
      ])

      return {
        players,
        visits,
        certificates,
        stats,
        // Calculs des rapports
        visitsPerMonth: this.calculateVisitsPerMonth(visits),
        fitnessStatus: this.calculateFitnessStatus(players),
        injuryTrends: this.calculateInjuryTrends(visits),
        moduleUsage: this.calculateModuleUsage(visits),
        certificatesExpiry: this.calculateCertificatesExpiry(certificates),
        // KPIs
        kpis: {
          totalVisits: visits.length,
          fitnessRate: stats.fitnessRate || 0,
          activeInjuries: this.countActiveInjuries(visits),
          activePlayers: players.length
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error)
      throw error
    }
  },

  /**
   * Calculer les visites par mois et par module
   */
  calculateVisitsPerMonth(visits) {
    const months = []
    const now = new Date()
    
    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
      months.push({
        mois: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        month: date.getMonth(),
        year: date.getFullYear(),
        PCMA: 0,
        GPS: 0,
        Impedance: 0,
        Blessures: 0,
        Nutrition: 0
      })
    }

    // Compter les visites par module
    visits.forEach(visit => {
      const visitDate = new Date(visit.visit_date)
      const monthData = months.find(m => 
        m.month === visitDate.getMonth() && 
        m.year === visitDate.getFullYear()
      )
      
      if (monthData && visit.module) {
        if (monthData.hasOwnProperty(visit.module)) {
          monthData[visit.module]++
        }
      }
    })

    return months.map(({ month, year, ...rest }) => rest)
  },

  /**
   * Calculer la distribution des statuts d'aptitude
   */
  calculateFitnessStatus(players) {
    const statusCount = {
      APTE: 0,
      APTE_RESTRICTIONS: 0,
      TEMP_INAPTE: 0,
      INAPTE: 0
    }

    players.forEach(player => {
      if (statusCount.hasOwnProperty(player.status || player.current_status)) {
        statusCount[player.status || player.current_status]++
      }
    })

    return [
      { status: 'APTE', count: statusCount.APTE, color: '#10b981' },
      { status: 'APTE_RESTRICTIONS', count: statusCount.APTE_RESTRICTIONS, color: '#eab308' },
      { status: 'TEMP_INAPTE', count: statusCount.TEMP_INAPTE, color: '#f97316' },
      { status: 'INAPTE', count: statusCount.INAPTE, color: '#ef4444' }
    ]
  },

  /**
   * Calculer les tendances des blessures
   */
  calculateInjuryTrends(visits) {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
      months.push({
        mois: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        month: date.getMonth(),
        year: date.getFullYear(),
        blessures: 0,
        joueurs_disponibles: 0
      })
    }

    // Compter les blessures par mois (visites de type "Blessures")
    visits.forEach(visit => {
      const visitDate = new Date(visit.visit_date)
      const monthData = months.find(m => 
        m.month === visitDate.getMonth() && 
        m.year === visitDate.getFullYear()
      )
      
      if (monthData && visit.module === 'Blessures') {
        monthData.blessures++
      }
    })

    // Calculer les joueurs disponibles (approximation)
    months.forEach(m => {
      m.joueurs_disponibles = 28 - m.blessures // Approximation
    })

    return months.map(({ month, year, ...rest }) => rest)
  },

  /**
   * Calculer l'utilisation des modules
   */
  calculateModuleUsage(visits) {
    const moduleCount = {}
    const moduleColors = {
      'GPS': '#10b981',
      'PCMA': '#3b82f6',
      'Impédancemétrie': '#a855f7',
      'Nutrition': '#f97316',
      'Blessures': '#ef4444'
    }

    visits.forEach(visit => {
      if (visit.module) {
        moduleCount[visit.module] = (moduleCount[visit.module] || 0) + 1
      }
    })

    return Object.keys(moduleCount)
      .map(module => ({
        module,
        visites: moduleCount[module],
        color: moduleColors[module] || '#64748b'
      }))
      .sort((a, b) => b.visites - a.visites)
  },

  /**
   * Calculer l'expiration des certificats
   */
  calculateCertificatesExpiry(certificates) {
    const now = new Date()
    const result = [
      { periode: 'Ce mois', valides: 0, expirent: 0, expires: 0 },
      { periode: '1-3 mois', valides: 0, expirent: 0, expires: 0 },
      { periode: '3-6 mois', valides: 0, expirent: 0, expires: 0 }
    ]

    certificates.forEach(cert => {
      if (!cert.validity_end) return
      
      const expiryDate = new Date(cert.validity_end)
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) {
        result[0].expires++
      } else if (daysUntilExpiry <= 30) {
        result[0].expirent++
      } else if (daysUntilExpiry <= 90) {
        result[1].valides++
      } else if (daysUntilExpiry <= 180) {
        result[2].valides++
      }
    })

    return result
  },

  /**
   * Compter les blessures actives
   */
  countActiveInjuries(visits) {
    // Compter les visites de type "Blessures" du dernier mois
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    return visits.filter(visit => 
      visit.module === 'Blessures' && 
      new Date(visit.visit_date) >= lastMonth
    ).length
  },

  /**
   * Obtenir les statistiques de performance GPS
   */
  async getPerformanceStats() {
    try {
      // Cette méthode pourrait être étendue pour récupérer les vraies stats GPS
      return {
        avgDistance: 10.2,
        avgMaxSpeed: 32.1,
        avgSprints: 18,
        avgPlayerLoad: 485
      }
    } catch (error) {
      console.error('Erreur:', error)
      return null
    }
  },

  /**
   * Obtenir les statistiques médicales détaillées
   */
  async getMedicalStats() {
    try {
      // Cette méthode pourrait être étendue pour récupérer les vraies stats médicales
      return {
        avgBP: '128/78',
        avgHR: 62,
        avgEF: 60,
        avgBMI: 22.8,
        avgBodyFat: 12.5,
        avgLeanMass: 65.2,
        avgCalories: 2850,
        avgHydration: 3.4,
        avgProtein: 1.8
      }
    } catch (error) {
      console.error('Erreur:', error)
      return null
    }
  }
}

export default reportsService

