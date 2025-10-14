import { useEffect, useRef } from 'react'
import { saveFormData, restoreFormData } from '../utils/formPersistence'

/**
 * Hook pour sauvegarder et restaurer automatiquement les données du formulaire
 * lors de la création d'une visite
 * 
 * @param {string} moduleType - Type de module (pcma, gps, care, examen_medical, soins, etc.)
 * @param {object} formData - État actuel du formulaire
 * @param {function} setFormData - Fonction pour mettre à jour le formulaire
 * @param {string} visitId - ID de la visite (null si pas encore créée)
 */
export function useFormPersistence(moduleType, formData, setFormData, visitId) {
  const hasRestoredRef = useRef(false)

  // Restaurer les données au montage du composant (après rechargement)
  useEffect(() => {
    // Ne restaurer qu'une seule fois et seulement si on a un visitId (après création)
    if (hasRestoredRef.current || !visitId) return
    
    const savedData = restoreFormData(moduleType)
    if (savedData) {
      console.log('📦 Restauration des données du formulaire:', moduleType)
      setFormData(prev => ({
        ...prev,
        ...savedData
      }))
      hasRestoredRef.current = true
    }
  }, [moduleType, visitId, setFormData])

  // Écouter l'événement de sauvegarde avant création de visite
  useEffect(() => {
    const handleSaveEvent = (event) => {
      console.log('💾 Sauvegarde des données du formulaire avant création de visite')
      saveFormData(moduleType, formData)
    }

    window.addEventListener('saveFormBeforeVisitCreation', handleSaveEvent)
    
    return () => {
      window.removeEventListener('saveFormBeforeVisitCreation', handleSaveEvent)
    }
  }, [moduleType, formData])
}

