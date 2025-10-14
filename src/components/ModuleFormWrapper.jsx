import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Save, ArrowRight, ChevronRight } from 'lucide-react'

export function ModuleFormWrapper({ 
  visitId, 
  playerId, 
  moduleName,
  service,
  initialData = {},
  children 
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)
  
  // Récupérer les informations de navigation multi-modules
  const { moduleSequence, currentModuleIndex } = location.state || {}

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!visitId) {
      toast.error('ID de visite manquant')
      return
    }

    try {
      setLoading(true)
      
      // Enregistrer via le service
      await service.create(visitId, formData)
      
      toast.success(`${moduleName} enregistré avec succès !`)
      
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
        // Dernier module ou module unique - rediriger normalement
        if (playerId) {
          navigate(`/players/${playerId}`)
        } else {
          navigate('/visits')
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
      toast.error(`Erreur lors de l'enregistrement du ${moduleName}`)
    } finally {
      setLoading(false)
    }
  }
  
  // Fonction pour passer au module suivant sans sauvegarder
  const handleSkipToNext = () => {
    if (!moduleSequence || currentModuleIndex === undefined) return
    
    const nextModuleIndex = currentModuleIndex + 1
    if (nextModuleIndex >= moduleSequence.length) return
    
    const nextModule = moduleSequence[nextModuleIndex]
    
    toast.info(`Passage au module : ${nextModule.moduleId.toUpperCase()}`, {
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
  }

  const handleSaveDraft = async () => {
    if (!visitId) {
      toast.error('ID de visite manquant')
      return
    }

    try {
      setLoading(true)
      await service.create(visitId, formData)
      toast.success('Brouillon enregistré !')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'enregistrement du brouillon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Passer formData et handleChange aux enfants */}
      {typeof children === 'function' 
        ? children({ formData, handleChange, loading }) 
        : children
      }

      {/* Boutons d'action */}
      <div className="space-y-4 pt-4">
        {/* Indicateur de progression pour navigation multi-modules */}
        {moduleSequence && currentModuleIndex !== undefined && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Module {currentModuleIndex + 1} sur {moduleSequence.length}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {moduleSequence.map((m, i) => (
                  <span key={i} className={i === currentModuleIndex ? 'font-bold' : ''}>
                    {m.moduleId.toUpperCase()}{i < moduleSequence.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </p>
            </div>
            {currentModuleIndex < moduleSequence.length - 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSkipToNext}
                className="gap-2 border-blue-300 hover:bg-blue-100 hover:border-blue-400"
              >
                Passer au suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            className="h-11 rounded-xl border-2 hover:bg-slate-50"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="gap-2 h-11 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer brouillon'}
          </Button>
          <Button 
            type="submit" 
            className="gap-2 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
            disabled={loading}
          >
            {moduleSequence && currentModuleIndex !== undefined && currentModuleIndex < moduleSequence.length - 1 ? (
              <>
                <span>{loading ? 'Enregistrement...' : 'Enregistrer et suivant'}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                <span>{loading ? 'Validation...' : 'Valider la visite'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

// Hook pour utiliser le contexte du formulaire
export function useModuleForm() {
  // Ce hook pourrait être étendu si nécessaire
  return {
    // Fonctions utilitaires
  }
}

