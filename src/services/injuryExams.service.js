import api from './api'

const injuryExamsService = {
  async create(examData) {
    const response = await api.post('/injury_exams', examData)
    return response.data
  },

  async getByInjuryId(injuryId) {
    const response = await api.get(`/injury_exams/${injuryId}`)
    return response.data
  },

  async update(injuryId, examData) {
    const response = await api.put(`/injury_exams/${injuryId}`, examData)
    return response.data
  },

  async delete(injuryId) {
    const response = await api.delete(`/injury_exams/${injuryId}`)
    return response.data
  },

  // Fonctions utilitaires
  async getAll() {
    // Note: Cette fonction nécessiterait un endpoint GET /injury_exams
    // Pour l'instant, on utilise les visites pour récupérer les examens
    const response = await api.get('/visits')
    const visits = response.data
    const injuryVisits = visits.filter(visit => visit.module === 'injury')
    
    const examData = []
    for (const visit of injuryVisits) {
      try {
        const exam = await this.getByInjuryId(visit.id)
        examData.push(exam)
      } catch (error) {
        // Blessure sans examen, on ignore
      }
    }
    
    return examData
  },

  async getByPlayerId(playerId) {
    const response = await api.get('/visits')
    const visits = response.data.filter(visit => 
      visit.player_id === playerId && visit.module === 'injury'
    )
    
    const examData = []
    for (const visit of visits) {
      try {
        const exam = await this.getByInjuryId(visit.id)
        examData.push({ ...exam, visit })
      } catch (error) {
        // Blessure sans examen, on ignore
      }
    }
    
    return examData
  },

  // Fonctions de calcul
  calculateDaysSinceExam(examDate) {
    if (!examDate) return null
    const exam = new Date(examDate)
    const today = new Date()
    const diffTime = Math.abs(today - exam)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  // Fonctions d'évaluation
  getExamTypeCategory(examType) {
    if (!examType) return 'Inconnu'
    const typeMap = {
      'radiographie': 'Radiographie',
      'echographie': 'Échographie',
      'irm': 'IRM',
      'scanner': 'Scanner',
      'arthroscopie': 'Arthroscopie',
      'biopsie': 'Biopsie',
      'analyse_sang': 'Analyse de sang',
      'analyse_urine': 'Analyse d\'urine',
      'ecg': 'ECG',
      'echocardiographie': 'Échocardiographie'
    }
    return typeMap[examType] || examType
  },

  getExamPriorityCategory(examType) {
    if (!examType) return 'Inconnu'
    const priorityMap = {
      'radiographie': 'Standard',
      'echographie': 'Standard',
      'irm': 'Urgent',
      'scanner': 'Urgent',
      'arthroscopie': 'Urgent',
      'biopsie': 'Urgent',
      'analyse_sang': 'Standard',
      'analyse_urine': 'Standard',
      'ecg': 'Standard',
      'echocardiographie': 'Standard'
    }
    return priorityMap[examType] || 'Standard'
  },

  // Fonctions de statistiques
  async getExamStats() {
    const exams = await this.getAll()
    if (exams.length === 0) return null

    const stats = {
      totalExams: exams.length,
      byType: {},
      byMonth: {},
      avgDaysSinceExam: 0,
      mostCommonType: null,
      recentExams: []
    }

    // Analyser par type
    exams.forEach(exam => {
      if (exam.exam_type) {
        stats.byType[exam.exam_type] = (stats.byType[exam.exam_type] || 0) + 1
      }
    })

    // Analyser par mois
    exams.forEach(exam => {
      if (exam.exam_date) {
        const month = new Date(exam.exam_date).toISOString().substring(0, 7)
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1
      }
    })

    // Calculer la moyenne des jours depuis l'examen
    const daysSinceExams = exams
      .map(exam => this.calculateDaysSinceExam(exam.exam_date))
      .filter(days => days !== null)
    
    if (daysSinceExams.length > 0) {
      stats.avgDaysSinceExam = daysSinceExams.reduce((sum, days) => sum + days, 0) / daysSinceExams.length
    }

    // Trouver le type le plus commun
    stats.mostCommonType = Object.keys(stats.byType).reduce((a, b) => 
      stats.byType[a] > stats.byType[b] ? a : b, null
    )

    // Examens récents (30 derniers jours)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    stats.recentExams = exams.filter(exam => {
      if (!exam.exam_date) return false
      return new Date(exam.exam_date) >= thirtyDaysAgo
    })

    return stats
  },

  async getPlayerExamStats(playerId) {
    const exams = await this.getByPlayerId(playerId)
    if (exams.length === 0) return null

    const stats = {
      totalExams: exams.length,
      byType: {},
      avgDaysSinceExam: 0,
      mostRecentExam: null,
      upcomingExams: []
    }

    // Analyser par type
    exams.forEach(exam => {
      if (exam.exam_type) {
        stats.byType[exam.exam_type] = (stats.byType[exam.exam_type] || 0) + 1
      }
    })

    // Calculer la moyenne des jours depuis l'examen
    const daysSinceExams = exams
      .map(exam => this.calculateDaysSinceExam(exam.exam_date))
      .filter(days => days !== null)
    
    if (daysSinceExams.length > 0) {
      stats.avgDaysSinceExam = daysSinceExams.reduce((sum, days) => sum + days, 0) / daysSinceExams.length
    }

    // Trouver l'examen le plus récent
    if (exams.length > 0) {
      stats.mostRecentExam = exams
        .filter(exam => exam.exam_date)
        .sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date))[0]
    }

    return stats
  }
}

export default injuryExamsService
