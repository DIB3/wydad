import api from './api'

const mealTypeService = {
  async create(mealTypeData) {
    const response = await api.post('/meal_types', mealTypeData)
    return response.data
  },

  async getAll() {
    const response = await api.get('/meal_types')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/meal_types/${id}`)
    return response.data
  },

  async update(id, mealTypeData) {
    const response = await api.put(`/meal_types/${id}`, mealTypeData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/meal_types/${id}`)
    return response.data
  },

  // Utilitaires
  getDefaultMealTypes() {
    return [
      { name: 'Petit-déjeuner', description: 'Premier repas de la journée' },
      { name: 'Collation matinale', description: 'Collation entre le petit-déjeuner et le déjeuner' },
      { name: 'Déjeuner', description: 'Repas du midi' },
      { name: 'Collation après-midi', description: 'Collation entre le déjeuner et le dîner' },
      { name: 'Dîner', description: 'Repas du soir' },
      { name: 'Collation avant match', description: 'Repas léger avant compétition' },
      { name: 'Repas post-match', description: 'Repas de récupération après match' },
      { name: 'Collation avant entraînement', description: 'Collation avant séance d\'entraînement' },
      { name: 'Collation post-entraînement', description: 'Collation de récupération' },
    ]
  },

  getMealTypeIcon(name) {
    const icons = {
      'petit-déjeuner': '🌅',
      'collation matinale': '🍎',
      'déjeuner': '🍽️',
      'collation après-midi': '🥤',
      'dîner': '🌙',
      'collation avant match': '⚡',
      'repas post-match': '💪',
      'collation avant entraînement': '🏃',
      'collation post-entraînement': '🥤',
    }
    
    const key = name.toLowerCase()
    return icons[key] || '🍴'
  }
}

export default mealTypeService

