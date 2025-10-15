import api from './api'

const pcmaService = {
  async create(visitId, pcmaData) {
    const response = await api.post('/visit_pcma', {
      visit_id: visitId,
      ...pcmaData
    })
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_pcma/${visitId}`)
    return response.data
  },

  async update(visitId, pcmaData) {
    const response = await api.put(`/visit_pcma/${visitId}`, pcmaData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_pcma/${visitId}`)
    return response.data
  },

  // Fonctions utilitaires
  async getAll() {
    // Note: Cette fonction nécessiterait un endpoint GET /visit_pcma
    // Pour l'instant, on utilise les visites pour récupérer les PCMA
    const response = await api.get('/visits')
    const visits = response.data
    const pcmaVisits = visits.filter(visit => visit.module === 'pcma')
    
    const pcmaData = []
    for (const visit of pcmaVisits) {
      try {
        const pcma = await this.getByVisitId(visit.id)
        pcmaData.push(pcma)
      } catch (error) {
        // Visite sans PCMA, on ignore
      }
    }
    
    return pcmaData
  },

  async getByPlayerId(playerId) {
    const response = await api.get('/visits')
    
    // Debug: Afficher les modules des visites de ce joueur
    const playerVisits = response.data.filter(v => v.player_id === playerId)
    const modules = playerVisits.map(v => v.module)
    
    const visits = response.data.filter(visit => 
      visit.player_id === playerId && visit.module === 'pcma'
    )
    
    const pcmaData = []
    for (const visit of visits) {
      try {
        const pcma = await this.getByVisitId(visit.id)
        pcmaData.push({ ...pcma, visit })
      } catch (error) {
        // Visite sans PCMA, on ignore
      }
    }
    
    return pcmaData
  },

  // Fonctions de calcul
  calculateBMI(height, weight) {
    if (!height || !weight) return null
    return (weight / Math.pow(height / 100, 2)).toFixed(2)
  },

  calculateAge(birthDate) {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  },

  getBMICategory(bmi) {
    if (!bmi) return 'Inconnu'
    if (bmi < 18.5) return 'Sous-poids'
    if (bmi < 25) return 'Normal'
    if (bmi < 30) return 'Surpoids'
    return 'Obésité'
  },

  getAptitudeStatus(pcmaData) {
    if (!pcmaData.aptitude) return 'Non défini'
    
    const statusMap = {
      'APTE': 'Apte',
      'APTE_RESTRICTIONS': 'Apte avec restrictions',
      'TEMP_INAPTE': 'Temporairement inapte',
      'INAPTE': 'Inapte'
    }
    
    return statusMap[pcmaData.aptitude] || pcmaData.aptitude
  }
}

export default pcmaService
