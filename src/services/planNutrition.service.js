import api from './api'

const planNutritionService = {
  // Plans de semaine
  async createPlan(planData) {
    const response = await api.post('/plan_semaine_nutrition', planData)
    return response.data
  },

  async getPlansByPlayer(playerId) {
    const response = await api.get(`/plan_semaine_nutrition/player/${playerId}`)
    return response.data
  },

  async getPlanDetails(planId) {
    const response = await api.get(`/plan_semaine_nutrition/${planId}/details`)
    return response.data
  },

  async deletePlan(planId) {
    const response = await api.delete(`/plan_semaine_nutrition/${planId}`)
    return response.data
  },

  // Repas dans un plan
  async addRepas(repasData) {
    const response = await api.post('/plan_semaine_nutrition/repas', repasData)
    return response.data
  },

  // Utilitaires
  getDaysOfWeek() {
    return [
      { value: 'lundi', label: 'Lundi' },
      { value: 'mardi', label: 'Mardi' },
      { value: 'mercredi', label: 'Mercredi' },
      { value: 'jeudi', label: 'Jeudi' },
      { value: 'vendredi', label: 'Vendredi' },
      { value: 'samedi', label: 'Samedi' },
      { value: 'dimanche', label: 'Dimanche' },
    ]
  },

  formatDateRange(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const options = { day: 'numeric', month: 'short' }
    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`
  },

  isActivePlan(startDate, endDate) {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return now >= start && now <= end
  },

  // Organiser les repas par jour
  organizeRepasByDay(repas) {
    const byDay = {}
    const days = this.getDaysOfWeek()
    
    days.forEach(day => {
      byDay[day.value] = []
    })
    
    repas.forEach(r => {
      if (byDay[r.jour_semaine]) {
        byDay[r.jour_semaine].push(r)
      }
    })
    
    return byDay
  }
}

export default planNutritionService

