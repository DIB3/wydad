import api from './api'

const nutritionService = {
  async create(visitId, nutritionData) {
    const response = await api.post('/visit_nutrition', {
      visit_id: visitId,
      ...nutritionData
    })
    return response.data
  },

  async getByVisitId(visitId) {
    const response = await api.get(`/visit_nutrition/${visitId}`)
    return response.data
  },

  async update(visitId, nutritionData) {
    const response = await api.put(`/visit_nutrition/${visitId}`, nutritionData)
    return response.data
  },

  async delete(visitId) {
    const response = await api.delete(`/visit_nutrition/${visitId}`)
    return response.data
  },

  // Fonctions utilitaires
  async getAll() {
    const response = await api.get('/visits')
    const visits = response.data
    const nutritionVisits = visits.filter(visit => visit.module === 'nutrition')
    
    const nutritionData = []
    for (const visit of nutritionVisits) {
      try {
        const nutrition = await this.getByVisitId(visit.id)
        nutritionData.push(nutrition)
      } catch (error) {
        // Visite sans nutrition, on ignore
      }
    }
    
    return nutritionData
  },

  async getByPlayerId(playerId) {
    const response = await api.get('/visits')
    const visits = response.data.filter(visit => 
      visit.player_id === playerId && visit.module === 'nutrition'
    )
    
    const nutritionData = []
    for (const visit of visits) {
      try {
        const nutrition = await this.getByVisitId(visit.id)
        nutritionData.push({ ...nutrition, visit })
      } catch (error) {
        // Visite sans nutrition, on ignore
      }
    }
    
    return nutritionData
  },

  // Fonctions de calcul
  calculateCaloriesFromMacros(protein, carbs, fat) {
    if (!protein || !carbs || !fat) return null
    return (protein * 4) + (carbs * 4) + (fat * 9)
  },

  calculateMacroPercentages(protein, carbs, fat, totalCalories) {
    if (!totalCalories || totalCalories === 0) return null
    
    const proteinCal = protein * 4
    const carbsCal = carbs * 4
    const fatCal = fat * 9
    
    return {
      protein: ((proteinCal / totalCalories) * 100).toFixed(1),
      carbs: ((carbsCal / totalCalories) * 100).toFixed(1),
      fat: ((fatCal / totalCalories) * 100).toFixed(1)
    }
  },

  calculateProteinPerKg(protein, weight) {
    if (!protein || !weight) return null
    return (protein / weight).toFixed(2)
  },

  calculateCarbsPerKg(carbs, weight) {
    if (!carbs || !weight) return null
    return (carbs / weight).toFixed(2)
  },

  calculateFatPerKg(fat, weight) {
    if (!fat || !weight) return null
    return (fat / weight).toFixed(2)
  },

  calculateHydrationPerKg(hydration, weight) {
    if (!hydration || !weight) return null
    return (hydration / weight).toFixed(2)
  },

  // Fonctions d'évaluation
  getCalorieCategory(kcal, weight, activityLevel) {
    if (!kcal || !weight) return 'Inconnu'
    
    const kcalPerKg = kcal / weight
    let category = 'Inconnu'
    
    if (activityLevel === 'low') {
      if (kcalPerKg < 25) category = 'Très faible'
      else if (kcalPerKg < 30) category = 'Faible'
      else if (kcalPerKg < 35) category = 'Normal'
      else category = 'Élevé'
    } else if (activityLevel === 'moderate') {
      if (kcalPerKg < 30) category = 'Très faible'
      else if (kcalPerKg < 35) category = 'Faible'
      else if (kcalPerKg < 40) category = 'Normal'
      else category = 'Élevé'
    } else if (activityLevel === 'high') {
      if (kcalPerKg < 35) category = 'Très faible'
      else if (kcalPerKg < 40) category = 'Faible'
      else if (kcalPerKg < 45) category = 'Normal'
      else category = 'Élevé'
    }
    
    return category
  },

  getProteinCategory(proteinPerKg) {
    if (!proteinPerKg) return 'Inconnu'
    if (proteinPerKg < 1.2) return 'Faible'
    if (proteinPerKg < 1.6) return 'Normal'
    if (proteinPerKg < 2.0) return 'Élevé'
    return 'Très élevé'
  },

  getCarbsCategory(carbsPerKg) {
    if (!carbsPerKg) return 'Inconnu'
    if (carbsPerKg < 3) return 'Faible'
    if (carbsPerKg < 5) return 'Normal'
    if (carbsPerKg < 7) return 'Élevé'
    return 'Très élevé'
  },

  getFatCategory(fatPerKg) {
    if (!fatPerKg) return 'Inconnu'
    if (fatPerKg < 0.8) return 'Faible'
    if (fatPerKg < 1.2) return 'Normal'
    if (fatPerKg < 1.6) return 'Élevé'
    return 'Très élevé'
  },

  getHydrationCategory(hydrationPerKg) {
    if (!hydrationPerKg) return 'Inconnu'
    if (hydrationPerKg < 30) return 'Faible'
    if (hydrationPerKg < 40) return 'Normal'
    if (hydrationPerKg < 50) return 'Élevé'
    return 'Très élevé'
  },

  // Fonctions de recommandations
  getProteinRecommendation(weight, activityLevel) {
    if (!weight) return null
    
    let proteinPerKg = 1.2 // Base
    if (activityLevel === 'moderate') proteinPerKg = 1.4
    else if (activityLevel === 'high') proteinPerKg = 1.6
    else if (activityLevel === 'very_high') proteinPerKg = 1.8
    
    return Math.round(weight * proteinPerKg)
  },

  getCarbsRecommendation(weight, activityLevel) {
    if (!weight) return null
    
    let carbsPerKg = 3 // Base
    if (activityLevel === 'moderate') carbsPerKg = 4
    else if (activityLevel === 'high') carbsPerKg = 5
    else if (activityLevel === 'very_high') carbsPerKg = 6
    
    return Math.round(weight * carbsPerKg)
  },

  getFatRecommendation(weight, activityLevel) {
    if (!weight) return null
    
    let fatPerKg = 0.8 // Base
    if (activityLevel === 'moderate') fatPerKg = 1.0
    else if (activityLevel === 'high') fatPerKg = 1.2
    else if (activityLevel === 'very_high') fatPerKg = 1.4
    
    return Math.round(weight * fatPerKg)
  },

  getHydrationRecommendation(weight, activityLevel) {
    if (!weight) return null
    
    let hydrationPerKg = 35 // Base ml/kg
    if (activityLevel === 'moderate') hydrationPerKg = 40
    else if (activityLevel === 'high') hydrationPerKg = 45
    else if (activityLevel === 'very_high') hydrationPerKg = 50
    
    return Math.round(weight * hydrationPerKg)
  },

  // Fonctions de statistiques
  async getPlayerNutritionStats(playerId) {
    const nutritionData = await this.getByPlayerId(playerId)
    if (nutritionData.length === 0) return null

    const stats = {
      totalPlans: nutritionData.length,
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      avgHydration: 0,
      calorieTrend: [],
      macroTrend: {
        protein: [],
        carbs: [],
        fat: []
      }
    }

    if (stats.totalPlans > 0) {
      stats.avgCalories = nutritionData.reduce((sum, plan) => sum + (plan.kcal_target || 0), 0) / stats.totalPlans
      stats.avgProtein = nutritionData.reduce((sum, plan) => sum + (plan.protein_g || 0), 0) / stats.totalPlans
      stats.avgCarbs = nutritionData.reduce((sum, plan) => sum + (plan.carbs_g || 0), 0) / stats.totalPlans
      stats.avgFat = nutritionData.reduce((sum, plan) => sum + (plan.fat_g || 0), 0) / stats.totalPlans
      stats.avgHydration = nutritionData.reduce((sum, plan) => sum + (plan.hydration_l || 0), 0) / stats.totalPlans

      // Tendance des calories
      nutritionData.forEach(plan => {
        if (plan.visit && plan.visit.visit_date) {
          stats.calorieTrend.push({
            date: plan.visit.visit_date,
            calories: plan.kcal_target
          })
        }
      })

      // Tendance des macros
      nutritionData.forEach(plan => {
        if (plan.visit && plan.visit.visit_date) {
          stats.macroTrend.protein.push({
            date: plan.visit.visit_date,
            value: plan.protein_g
          })
          stats.macroTrend.carbs.push({
            date: plan.visit.visit_date,
            value: plan.carbs_g
          })
          stats.macroTrend.fat.push({
            date: plan.visit.visit_date,
            value: plan.fat_g
          })
        }
      })
    }

    return stats
  }
}

export default nutritionService
