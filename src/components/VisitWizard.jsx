import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2,
  Activity,
  Navigation,
  Scale,
  Stethoscope,
  Utensils,
  User,
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  FileText,
  Bandage
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { useAuth } from '../contexts/AuthContext'
import visitService from '../services/visit.service'
import { toast } from 'sonner'

const steps = [
  { id: 1, name: 'Joueur', description: 'Sélection du joueur', icon: User },
  { id: 2, name: 'Module', description: 'Type de visite', icon: Activity },
  { id: 3, name: 'Confirmation', description: 'Vérification', icon: Check },
]

const modules = [
  {
    id: 'pcma',
    name: 'PCMA',
    title: 'Examen médical complet',
    description: 'Examen médical complet incluant l\'anthropométrie, les signes vitaux, l\'ECG, l\'échocardiographie, la fonction respiratoire, la biologie et l\'examen musculo-squelettique.',
    icon: Stethoscope,
    gradient: 'from-blue-600 to-blue-400',
    bgColor: 'bg-primary/5',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600'
  },
  {
    id: 'gps',
    name: 'GPS',
    title: 'Données de performance',
    description: 'Enregistrement des données GPS de performance : distance, vitesse, accélérations, charge physique et fréquence cardiaque.',
    icon: Navigation,
    gradient: 'from-indigo-600 to-indigo-400',
    bgColor: 'bg-primary/10',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'impedance',
    name: 'Impédancemétrie',
    title: 'Composition corporelle',
    description: 'Analyse de la composition corporelle par bioimpédance : masse grasse, masse maigre, hydratation et répartition segmentaire.',
    icon: Scale,
    gradient: 'from-teal-600 to-teal-400',
    bgColor: 'bg-primary/5',
    borderColor: 'border-teal-300',
    iconColor: 'text-teal-600'
  },
  {
    id: 'injury',
    name: 'Blessure',
    title: 'Suivi des blessures',
    description: 'Enregistrement et suivi des blessures : détails de la blessure, examen clinique, imagerie, plan de traitement et suivi.',
    icon: Activity,
    gradient: 'from-violet-600 to-violet-400',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-violet-300',
    iconColor: 'text-violet-600'
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    title: 'Consultation nutritionnelle',
    description: 'Consultation nutritionnelle : évaluation alimentaire, objectifs nutritionnels, plan de repas et supplémentation.',
    icon: Utensils,
    gradient: 'from-sky-600 to-sky-400',
    bgColor: 'bg-primary/10',
    borderColor: 'border-sky-300',
    iconColor: 'text-sky-600'
  },
  {
    id: 'care',
    name: 'Soins',
    title: 'Soins et récupération',
    description: 'Séance de soins : Tecar, ultrason, massages, normatec, cryothérapie, BTL, compex, ondes de choc, renforcement, sauna.',
    icon: Stethoscope,
    gradient: 'from-cyan-600 to-cyan-400',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-cyan-300',
    iconColor: 'text-cyan-600'
  },
  {
    id: 'examen_medical',
    name: 'Examen médical',
    title: 'Consultation médicale',
    description: 'Consultation médicale pour affections courantes : motif, symptômes, diagnostic, paramètres vitaux, examens demandés et traitement.',
    icon: FileText,
    gradient: 'from-emerald-600 to-emerald-400',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'soins',
    name: 'Soins & Traitements',
    title: 'Soins spécialisés',
    description: 'Suivi des soins et traitements : pansements, rééducation, injections, infiltrations avec évaluation des résultats.',
    icon: Bandage,
    gradient: 'from-rose-600 to-rose-400',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    iconColor: 'text-rose-600'
  },
]

export function VisitWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [selectedModules, setSelectedModules] = useState([]) // Changé en array pour sélection multiple
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [isScheduled, setIsScheduled] = useState(false) // Nouvelle option : visite programmée
  const [creating, setCreating] = useState(false)
  const { players } = usePlayers()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Obtenir la date minimum (aujourd'hui)
  const today = new Date().toISOString().split('T')[0]

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return selectedPlayer !== ''
    if (currentStep === 2) return selectedModules.length > 0 // Au moins un module sélectionné
    return true
  }

  const toggleModule = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId) // Retirer si déjà sélectionné
        : [...prev, moduleId] // Ajouter si pas encore sélectionné
    )
  }

  const createVisit = async () => {
    setCreating(true)
    
    try {
      // Vérifications avant création
      if (!selectedPlayer) {
        toast.error('Veuillez sélectionner un joueur')
        setCreating(false)
        return
      }
      
      if (selectedModules.length === 0) {
        toast.error('Veuillez sélectionner au moins un module')
        setCreating(false)
        return
      }
      
      if (!user?.id) {
        toast.error('Utilisateur non connecté')
        setCreating(false)
        return
      }
      
      // Créer une visite pour chaque module sélectionné
      const createdVisits = []
      
      for (const moduleId of selectedModules) {
        const visitData = {
          player_id: selectedPlayer,
          visit_date: visitDate,
          module: moduleId,
          created_by: user.id
        }
        
        console.log('📝 Création de visite avec données:', visitData)
        
        const createdVisit = await visitService.create(visitData)
        createdVisits.push({ ...createdVisit, moduleId })
      }
      
      // Messages de succès
      const isFuture = new Date(visitDate) > new Date(today)
      if (selectedModules.length === 1) {
        if (isFuture) {
          toast.success('Visite programmée avec succès !', {
            description: `Pour le ${new Date(visitDate).toLocaleDateString('fr-FR')}`
          })
        } else {
          toast.success('Visite créée avec succès !')
        }
      } else {
        if (isFuture) {
          toast.success(`${selectedModules.length} visites programmées avec succès !`, {
            description: `Pour le ${new Date(visitDate).toLocaleDateString('fr-FR')}`
          })
        } else {
          toast.success(`${selectedModules.length} visites créées avec succès !`)
        }
      }

      // Mapping des routes de modules
      const moduleRoutes = {
        pcma: '/modules/pcma',
        gps: '/modules/gps',
        impedance: '/modules/impedance',
        injury: '/modules/injuries',
        nutrition: '/modules/nutrition',
        care: '/modules/care',
        examen_medical: '/modules/examen_medical',
        soins: '/modules/soins',
      }

      // Si visite programmée (future), rediriger vers la liste des visites
      if (isFuture) {
        toast.info('Visite(s) programmée(s)', {
          description: 'Vous pourrez les remplir le jour prévu'
        })
        navigate('/visits')
        return
      }

      // Si un seul module ET visite aujourd'hui, rediriger vers le formulaire
      if (selectedModules.length === 1) {
        navigate(moduleRoutes[selectedModules[0]] || '/', {
          state: {
            visitId: createdVisits[0].id,
            playerId: selectedPlayer
          }
        })
      } else {
        // Si plusieurs modules, rediriger vers le premier module avec navigation séquentielle
        const moduleSequence = selectedModules.map((moduleId, index) => ({
          moduleId,
          visitId: createdVisits[index].id,
          route: moduleRoutes[moduleId]
        }))

        toast.success(`Navigation vers le premier module sur ${selectedModules.length}`)
        
        // Rediriger vers le premier module avec toute la séquence
        navigate(moduleRoutes[selectedModules[0]] || '/', {
          state: {
            visitId: createdVisits[0].id,
            playerId: selectedPlayer,
            moduleSequence, // Toute la séquence des modules
            currentModuleIndex: 0 // Index du module actuel
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création de la visite:', error)
      toast.error('Erreur lors de la création de la visite')
      setCreating(false)
    }
  }

  const selectedPlayerData = players.find((p) => p.id === selectedPlayer)

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Progress Steps */}
      <div className="relative">
      <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
          <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center w-full">
              <div
                className={cn(
                      'relative flex h-20 w-20 items-center justify-center rounded-full border-3 transition-all duration-300 shadow-xl',
                      isCompleted
                        ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-blue-400 text-white scale-100'
                        : isActive
                          ? 'border-primary bg-gradient-to-br from-primary to-blue-600 text-white scale-110 shadow-primary/50'
                          : 'border-gray-300 bg-white text-gray-400 scale-95',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-8 w-8 animate-in zoom-in duration-300" />
                    ) : (
                      <StepIcon className={cn("h-8 w-8", isActive && "animate-pulse")} />
                    )}
                    {isActive && (
                      <span className="absolute -inset-2 rounded-full bg-primary/20 animate-ping" />
                    )}
              </div>
                  <div className="mt-4 text-center">
                    <p className={cn(
                      "text-base font-bold transition-colors",
                      isActive ? "text-primary" : isCompleted ? "text-blue-600" : "text-muted-foreground"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
                  <div className="relative flex-1 mx-4 mt-[-40px]">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500 ease-out rounded-full',
                          currentStep > step.id 
                            ? 'w-full bg-gradient-to-r from-blue-600 to-blue-400' 
                            : 'w-0 bg-primary'
                        )}
                      />
                    </div>
                  </div>
            )}
          </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-2 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-b p-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              {currentStep === 1 && <User className="h-7 w-7 text-white" />}
              {currentStep === 2 && <Activity className="h-7 w-7 text-white" />}
              {currentStep === 3 && <Check className="h-7 w-7 text-white" />}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{steps[currentStep - 1].name}</CardTitle>
              <p className="text-base text-muted-foreground mt-1">{steps[currentStep - 1].description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[500px] p-8">
          {/* Step 1: Player Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="player" className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Sélectionner un joueur <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger id="player" className="h-14 text-lg border-2 hover:border-primary transition-colors">
                    <SelectValue placeholder="Choisir un joueur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id} className="cursor-pointer text-base py-3">
                        <div className="flex items-center gap-2 py-1">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {player.first_name?.[0]}{player.last_name?.[0]}
                          </div>
                          <span className="font-medium">{player.first_name} {player.last_name}</span>
                          <span className="text-muted-foreground">- {player.position || 'Sans poste'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlayerData && (
                <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 shadow-lg animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                      {selectedPlayerData.first_name?.[0]}{selectedPlayerData.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Informations du joueur
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Nom complet</p>
                          <p className="font-semibold text-sm">{selectedPlayerData.first_name} {selectedPlayerData.last_name}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Poste
                          </p>
                          <p className="font-semibold text-sm">{selectedPlayerData.position || 'Non défini'}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Âge
                          </p>
                          <p className="font-semibold text-sm">
                      {selectedPlayerData.birth_date
                              ? `${new Date().getFullYear() - new Date(selectedPlayerData.birth_date).getFullYear()} ans`
                              : 'Non défini'}
                    </p>
                  </div>
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Statut</p>
                          <p className="font-semibold text-sm text-blue-600">✓ Actif</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!selectedPlayerData && (
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Sélectionnez un joueur pour voir ses informations</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Module Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Type(s) de visite <span className="text-destructive">*</span>
                </Label>
                <p className="text-base text-muted-foreground flex items-center gap-2 flex-wrap">
                  Sélectionnez un ou plusieurs modules
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    Sélection multiple
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map((module) => {
                  const ModuleIcon = module.icon
                  const isSelected = selectedModules.includes(module.id)
                  
                  return (
                    <div
                      key={module.id}
                      onClick={() => toggleModule(module.id)}
                      className={cn(
                        'relative rounded-2xl border-2 p-7 cursor-pointer transition-all duration-300 group',
                        isSelected
                          ? `${module.borderColor} bg-gradient-to-br ${module.bgColor} shadow-xl scale-105 ring-4 ring-offset-2`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:scale-102'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-5">
                        <div className={cn(
                          'h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                          isSelected
                            ? `bg-gradient-to-br ${module.gradient} text-white shadow-xl`
                            : `bg-gray-100 ${module.iconColor} group-hover:bg-gray-200`
                        )}>
                          <ModuleIcon className="h-8 w-8" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "text-lg font-bold mb-2 transition-colors",
                            isSelected ? module.iconColor : "text-gray-900"
                          )}>
                            {module.name}
                          </h4>
                          <p className={cn(
                            "text-base mb-3 font-medium",
                            isSelected ? module.iconColor : "text-gray-600"
                          )}>
                            {module.title}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedModules.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedModules.length} module{selectedModules.length > 1 ? 's' : ''} sélectionné{selectedModules.length > 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedModules.map(moduleId => {
                      const moduleData = modules.find(m => m.id === moduleId)
                      if (!moduleData) return null
                      
                      return (
                        <div key={moduleId} className={cn(
                          'rounded-lg border-2 p-3 shadow-sm animate-in slide-in-from-top-4 duration-300',
                          moduleData.borderColor,
                          `bg-gradient-to-br ${moduleData.bgColor}`
                        )}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'h-8 w-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0',
                              `bg-gradient-to-br ${moduleData.gradient} text-white`
                            )}>
                              {(() => {
                                const Icon = moduleData.icon
                                return <Icon className="h-4 w-4" />
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 truncate">{moduleData.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{moduleData.title}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label htmlFor="visit-date" className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Date de la visite
                </Label>
                
                {/* Options de date */}
                <div className="space-y-3">
                  {/* Option 1: Aujourd'hui */}
                  <div 
                    onClick={() => {
                      setIsScheduled(false)
                      setVisitDate(today)
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all',
                      !isScheduled 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        !isScheduled ? 'border-blue-600' : 'border-gray-400'
                      )}>
                        {!isScheduled && <div className="h-3 w-3 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          'font-semibold',
                          !isScheduled ? 'text-blue-900' : 'text-gray-700'
                        )}>
                          📅 Aujourd'hui - Visite immédiate
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date().toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Programmer */}
                  <div 
                    onClick={() => setIsScheduled(true)}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all',
                      isScheduled 
                        ? 'border-destructive bg-destructive/5 shadow-md' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        isScheduled ? 'border-purple-600' : 'border-gray-400'
                      )}>
                        {isScheduled && <div className="h-3 w-3 rounded-full bg-destructive" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          'font-semibold',
                          isScheduled ? 'text-purple-900' : 'text-gray-700'
                        )}>
                          ⏰ Programmer une visite future
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Choisir une date ultérieure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sélecteur de date (si programmée) */}
                {isScheduled && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <Input 
                      id="visit-date" 
                      type="date"
                      value={visitDate}
                      min={today}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="h-14 text-lg border-2 border-destructive hover:border-destructive/70 bg-destructive/5 transition-colors"
                    />
                    <p className="text-xs text-purple-700 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Date sélectionnée : {new Date(visitDate).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-8">
                <div className="space-y-3">
                <Label className="text-lg font-bold flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Récapitulatif de la visite
                </Label>
                <p className="text-base text-muted-foreground">Vérifiez les informations avant de créer la visite</p>
              </div>

              <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-8 shadow-lg">
                <div className="space-y-6">
                  {/* Player Info */}
                  <div className="flex items-start gap-5 p-6 bg-white/70 rounded-xl">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                      {selectedPlayerData?.first_name?.[0]}{selectedPlayerData?.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2 font-medium flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Joueur sélectionné
                      </p>
                      <p className="font-bold text-xl text-gray-900">
                        {selectedPlayerData?.first_name} {selectedPlayerData?.last_name}
                      </p>
                      <p className="text-base text-muted-foreground">
                      {selectedPlayerData?.position || 'Sans poste'}
                    </p>
                  </div>
                  </div>

                  {/* Modules Info */}
                  {selectedModules.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {selectedModules.length} Module{selectedModules.length > 1 ? 's' : ''} sélectionné{selectedModules.length > 1 ? 's' : ''}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedModules.map(moduleId => {
                          const moduleData = modules.find(m => m.id === moduleId)
                          if (!moduleData) return null
                          
                          return (
                            <div key={moduleId} className={cn(
                              'flex items-start gap-4 p-5 rounded-xl border-2',
                              moduleData.bgColor,
                              moduleData.borderColor
                            )}>
                              <div className={cn(
                                'h-12 w-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0',
                                `bg-gradient-to-br ${moduleData.gradient} text-white`
                              )}>
                                {(() => {
                                  const Icon = moduleData.icon
                                  return <Icon className="h-6 w-6" />
                                })()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-base text-gray-900 truncate">{moduleData.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{moduleData.title}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Date Info */}
                  <div className="flex items-start gap-5 p-6 bg-white/70 rounded-xl">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <Calendar className="h-8 w-8" />
                  </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2 font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Date de la visite
                      </p>
                      <p className="font-bold text-xl text-gray-900">
                      {new Date(visitDate).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                <Label htmlFor="visit-date-confirm" className="text-base font-semibold flex items-center gap-2 text-amber-900">
                  <Calendar className="h-5 w-5" />
                  Modifier la date si nécessaire
                </Label>
                <Input 
                  id="visit-date-confirm" 
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="h-14 text-lg border-2 border-amber-300 bg-white hover:border-amber-400 transition-colors"
                />
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Vous pouvez ajuster la date avant de créer la visite
                </p>
              </div>

              <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">
                      Prêt à créer {selectedModules.length > 1 ? `${selectedModules.length} visites` : 'la visite'}
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {selectedModules.length === 1 ? (
                        <>Cliquez sur <span className="font-bold">"Créer la visite"</span> pour enregistrer et accéder au formulaire.</>
                      ) : (
                        <>Cliquez pour créer <span className="font-bold">{selectedModules.length} visites</span> (une par module). Vous pourrez les remplir depuis l'onglet Visites.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1} 
          className={cn(
            "gap-3 h-14 px-8 text-base border-2 font-semibold transition-all duration-300",
            currentStep === 1 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-gray-100 hover:border-gray-400 hover:scale-105 shadow-md"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
          Précédent
        </Button>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-3 text-lg text-muted-foreground">
            <span className="font-bold text-primary text-2xl">{currentStep}</span>
            <span className="font-semibold">/</span>
            <span className="font-semibold">{steps.length}</span>
          </div>
        </div>

        {currentStep < steps.length ? (
          <Button 
            onClick={nextStep} 
            disabled={!canProceed()} 
            className={cn(
              "gap-3 h-14 px-8 text-base font-semibold transition-all duration-300 shadow-lg",
              "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90",
              !canProceed() 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:scale-105 hover:shadow-xl"
            )}
          >
            Suivant
            <ChevronRight className="h-6 w-6" />
          </Button>
        ) : (
          <Button 
            onClick={createVisit} 
            disabled={!canProceed() || creating} 
            className={cn(
              "gap-3 h-14 px-10 text-base font-bold transition-all duration-300",
              "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
              "text-white shadow-xl",
              !creating && "hover:scale-105 hover:shadow-2xl",
              creating && "opacity-80 cursor-wait"
            )}
          >
            {creating ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Check className="h-6 w-6" />
                {selectedModules.length > 1 ? `Créer ${selectedModules.length} visites` : 'Créer la visite'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

