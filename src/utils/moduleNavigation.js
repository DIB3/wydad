import { toast } from 'sonner'

/**
 * Gère la navigation après la sauvegarde d'un formulaire de module
 * @param {Object} params
 * @param {Function} params.navigate - fonction navigate de react-router-dom
 * @param {Array} params.moduleSequence - séquence des modules à remplir
 * @param {number} params.currentModuleIndex - index du module actuel
 * @param {string} params.playerId - ID du joueur
 * @returns {void}
 */
export function handleModuleNavigation({ navigate, moduleSequence, currentModuleIndex, playerId }) {
  // Vérifier s'il y a un module suivant
  const hasNextModule = moduleSequence && currentModuleIndex !== undefined && currentModuleIndex < moduleSequence.length - 1
  
  if (hasNextModule) {
    // Naviguer vers le module suivant
    const nextModuleIndex = currentModuleIndex + 1
    const nextModule = moduleSequence[nextModuleIndex]
    
    toast.info(`Module suivant : ${nextModule.moduleId.toUpperCase()}`, {
      description: `Module ${nextModuleIndex + 1} sur ${moduleSequence.length}`
    })
    
    navigate(nextModule.route, {
      state: {
        visitId: nextModule.visitId,
        playerId: playerId,
        moduleSequence: moduleSequence,
        currentModuleIndex: nextModuleIndex
      }
    })
  } else {
    // Dernier module ou module unique - rediriger vers la page du joueur
    if (playerId) {
      navigate(`/players/${playerId}`)
    } else {
      navigate('/visits')
    }
  }
}

/**
 * Affiche un indicateur de progression si on est dans un flux multi-modules
 * @param {Object} params
 * @param {Array} params.moduleSequence - séquence des modules à remplir
 * @param {number} params.currentModuleIndex - index du module actuel
 * @returns {Object|null} - Objet avec les infos de progression ou null
 */
export function getModuleProgress({ moduleSequence, currentModuleIndex }) {
  if (!moduleSequence || currentModuleIndex === undefined) {
    return null
  }
  
  return {
    current: currentModuleIndex + 1,
    total: moduleSequence.length,
    isLast: currentModuleIndex === moduleSequence.length - 1,
    sequence: moduleSequence.map(m => m.moduleId.toUpperCase()).join(' → ')
  }
}

