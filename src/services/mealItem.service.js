import api from './api'

const mealItemService = {
  async create(mealItemData) {
    const response = await api.post('/meal_items', mealItemData)
    return response.data
  },

  async getAll() {
    const response = await api.get('/meal_items')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/meal_items/${id}`)
    return response.data
  },

  async update(id, mealItemData) {
    const response = await api.put(`/meal_items/${id}`, mealItemData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/meal_items/${id}`)
    return response.data
  },

  // Repas prédéfinis par défaut
  getDefaultMealItems() {
    return [
      { name: 'Omelette 3 œufs + pain complet', category: 'Protéines' },
      { name: 'Flocons d\'avoine 100g + banane + miel', category: 'Glucides' },
      { name: 'Poulet grillé 200g', category: 'Protéines' },
      { name: 'Riz basmati 150g', category: 'Glucides' },
      { name: 'Pâtes complètes 200g', category: 'Glucides' },
      { name: 'Saumon 200g', category: 'Protéines' },
      { name: 'Steak de bœuf 200g', category: 'Protéines' },
      { name: 'Patate douce 150g', category: 'Glucides' },
      { name: 'Légumes vapeur (brocoli, carottes)', category: 'Légumes' },
      { name: 'Salade verte + vinaigrette', category: 'Légumes' },
      { name: 'Fromage blanc 200g', category: 'Protéines' },
      { name: 'Fruits secs 50g (amandes, noix)', category: 'Lipides' },
      { name: 'Shake protéiné 30g', category: 'Protéines' },
      { name: 'Fruits frais (pomme, orange, banane)', category: 'Glucides' },
      { name: 'Yaourt grec 150g', category: 'Protéines' },
      { name: 'Pain complet 2 tranches', category: 'Glucides' },
      { name: 'Cottage cheese 150g', category: 'Protéines' },
      { name: 'Quinoa 150g', category: 'Glucides' },
      { name: 'Thon en conserve 150g', category: 'Protéines' },
      { name: 'Avocat 1/2', category: 'Lipides' },
    ]
  }
}

export default mealItemService

