/**
 * Système de persistance des formulaires
 * Sauvegarde et restaure les données des formulaires lors de la création de visite
 */

const FORM_DATA_KEY = 'temp_form_data'

/**
 * Sauvegarder les données du formulaire dans localStorage
 * @param {string} moduleType - Type de module (pcma, gps, care, etc.)
 * @param {object} formData - Données du formulaire
 */
export const saveFormData = (moduleType, formData) => {
  try {
    const dataToSave = {
      moduleType,
      formData,
      timestamp: Date.now()
    }
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(dataToSave))
    console.log('💾 Données du formulaire sauvegardées temporairement')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

/**
 * Restaurer les données du formulaire depuis localStorage
 * @param {string} moduleType - Type de module
 * @returns {object|null} - Données du formulaire ou null
 */
export const restoreFormData = (moduleType) => {
  try {
    const savedData = localStorage.getItem(FORM_DATA_KEY)
    if (!savedData) return null

    const parsed = JSON.parse(savedData)
    
    // Vérifier que les données correspondent au module actuel
    if (parsed.moduleType !== moduleType) return null
    
    // Vérifier que les données ne sont pas trop anciennes (max 5 minutes)
    const age = Date.now() - parsed.timestamp
    if (age > 5 * 60 * 1000) {
      localStorage.removeItem(FORM_DATA_KEY)
      return null
    }

    console.log('📦 Données du formulaire restaurées')
    
    // Nettoyer après restauration
    localStorage.removeItem(FORM_DATA_KEY)
    
    return parsed.formData
  } catch (error) {
    console.error('Erreur lors de la restauration:', error)
    return null
  }
}

/**
 * Nettoyer les données temporaires
 */
export const clearFormData = () => {
  try {
    localStorage.removeItem(FORM_DATA_KEY)
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error)
  }
}

