import api from './api'

const impedanceService = {
  async create(visitId, impedanceData) {
    const response = await api.post('/visit_impedance', {
      visit_id: visitId,
      ...impedanceData
    })
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_impedance/${visitId}`)
    return response.data
  },

  async update(visitId, impedanceData) {
    const response = await api.put(`/visit_impedance/${visitId}`, impedanceData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_impedance/${visitId}`)
    return response.data
  },

  // Fonctions utilitaires
  async getAll() {
    const response = await api.get('/visits')
    const visits = response.data
    const impedanceVisits = visits.filter(visit => visit.module === 'impedance')
    
    const impedanceData = []
    for (const visit of impedanceVisits) {
      try {
        const impedance = await this.getByVisitId(visit.id)
        impedanceData.push(impedance)
      } catch (error) {
        console.warn(`Impédance non trouvée pour la visite ${visit.id}`)
      }
    }
    
    return impedanceData
  },

  async getByPlayerId(playerId) {
    const response = await api.get('/visits')
    
    const visits = response.data.filter(visit => 
      visit.player_id === playerId && visit.module === 'impedance'
    )
    
    const impedanceData = []
    for (const visit of visits) {
      try {
        const impedance = await this.getByVisitId(visit.id)
        impedanceData.push({ ...impedance, visit })
      } catch (error) {
      }
    }
    
    return impedanceData
  },

  // Fonctions de calcul
  calculateBMI(height, weight) {
    if (!height || !weight) return null
    return (weight / Math.pow(height / 100, 2)).toFixed(2)
  },

  calculateBodyFatPercentage(impedanceData) {
    if (!impedanceData.body_fat_percent) return null
    return impedanceData.body_fat_percent
  },

  calculateLeanMass(impedanceData) {
    if (!impedanceData.lean_mass_kg) return null
    return impedanceData.lean_mass_kg
  },

  calculateMuscleMass(impedanceData) {
    if (!impedanceData.muscle_mass_kg) return null
    return impedanceData.muscle_mass_kg
  },

  calculateBoneMass(impedanceData) {
    if (!impedanceData.bone_mass_kg) return null
    return impedanceData.bone_mass_kg
  },

  calculateTBW(impedanceData) {
    if (!impedanceData.tbw_l) return null
    return impedanceData.tbw_l
  },

  calculateICW(impedanceData) {
    if (!impedanceData.icw_l) return null
    return impedanceData.icw_l
  },

  calculateECW(impedanceData) {
    if (!impedanceData.ecw_l) return null
    return impedanceData.ecw_l
  },

  calculatePhaseAngle(impedanceData) {
    if (!impedanceData.phase_angle_deg) return null
    return impedanceData.phase_angle_deg
  },

  calculateVisceralFat(impedanceData) {
    if (!impedanceData.visceral_fat_index) return null
    return impedanceData.visceral_fat_index
  },

  calculateBasalMetabolism(impedanceData) {
    if (!impedanceData.basal_metabolism_kcal) return null
    return impedanceData.basal_metabolism_kcal
  },

  calculateMetabolicAge(impedanceData) {
    if (!impedanceData.metabolic_age_years) return null
    return impedanceData.metabolic_age_years
  },

  calculateHydration(impedanceData) {
    if (!impedanceData.hydration_percent) return null
    return impedanceData.hydration_percent
  },

  // Fonctions d'évaluation
  getBodyFatCategory(bodyFatPercent) {
    if (!bodyFatPercent) return 'Inconnu'
    if (bodyFatPercent < 6) return 'Très faible'
    if (bodyFatPercent < 14) return 'Faible'
    if (bodyFatPercent < 18) return 'Normal'
    if (bodyFatPercent < 25) return 'Élevé'
    return 'Très élevé'
  },

  getPhaseAngleCategory(phaseAngle) {
    if (!phaseAngle) return 'Inconnu'
    if (phaseAngle < 4) return 'Faible'
    if (phaseAngle < 6) return 'Normal'
    if (phaseAngle < 8) return 'Bon'
    return 'Excellent'
  },

  getVisceralFatCategory(visceralFat) {
    if (!visceralFat) return 'Inconnu'
    if (visceralFat < 5) return 'Normal'
    if (visceralFat < 10) return 'Élevé'
    return 'Très élevé'
  },

  getHydrationCategory(hydration) {
    if (!hydration) return 'Inconnu'
    if (hydration < 50) return 'Déshydraté'
    if (hydration < 60) return 'Légèrement déshydraté'
    if (hydration < 70) return 'Normal'
    return 'Bien hydraté'
  }
}

export default impedanceService
