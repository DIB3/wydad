import { useState, useEffect, useCallback } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Plus, Trash2, Eye, Save, ChefHat, Search, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { usePlayers } from '@/hooks/usePlayers'
import { PlayerSelector } from '@/components/PlayerSelector'
import planNutritionService from '@/services/planNutrition.service'
import mealItemService from '@/services/mealItem.service'
import { toast } from 'sonner'
import { useVisits } from '@/hooks/useVisits'

// Types de repas fixes
const MEAL_TYPES = [
  { value: 'petit-dejeuner', label: 'Petit-déjeuner', icon: '🌅' },
  { value: 'collation-matin', label: 'Collation matinale', icon: '🍎' },
  { value: 'dejeuner', label: 'Déjeuner', icon: '🍽️' },
  { value: 'collation-apres-midi', label: 'Collation après-midi', icon: '🥤' },
  { value: 'diner', label: 'Dîner', icon: '🌙' },
  { value: 'collation-soir', label: 'Collation du soir', icon: '🥛' },
]

export default function PlansNutritionPage() {
  const { players } = usePlayers()
  const { visits } = useVisits()
  const [plans, setPlans] = useState([])
  const [mealItems, setMealItems] = useState([])
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [loading, setLoading] = useState(false)
  
  // État pour nouveau plan
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [startDate, setStartDate] = useState('')
  const [weekDays, setWeekDays] = useState([])
  const [weekMeals, setWeekMeals] = useState({})
  const [planComments, setPlanComments] = useState('')

  // État pour voir détails d'un plan
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [planDetails, setPlanDetails] = useState([])

  const loadMealItems = async () => {
    try {
      const data = await mealItemService.getAll()
      setMealItems(data)
    } catch (error) {
      console.error('Erreur lors du chargement des repas:', error)
    }
  }

  const loadPlayerPlans = useCallback(async () => {
    try {
      setLoading(true)
      const data = await planNutritionService.getPlansByPlayer(selectedPlayerId)
      setPlans(data)
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error)
      toast.error('Erreur lors du chargement des plans')
    } finally {
      setLoading(false)
    }
  }, [selectedPlayerId])

  useEffect(() => {
    loadMealItems()
  }, [])

  useEffect(() => {
    if (selectedPlayerId) {
      loadPlayerPlans()
    }
  }, [selectedPlayerId, loadPlayerPlans])

  // Générer les 7 jours de la semaine à partir d'une date
  const generateWeekDays = (dateString) => {
    if (!dateString) return []
    
    const startDate = new Date(dateString)
    const days = []
    const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      days.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: dayNames[currentDate.getDay()],
        displayDate: currentDate.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })
      })
    }
    
    return days
  }

  const handleStartDateChange = (date) => {
    setStartDate(date)
    const days = generateWeekDays(date)
    setWeekDays(days)
    
    // Initialiser les repas pour chaque jour
    const meals = {}
    days.forEach(day => {
      meals[day.dayName] = []
    })
    setWeekMeals(meals)
  }

  const addMealToDay = (dayName) => {
    setWeekMeals(prev => ({
      ...prev,
      [dayName]: [...(prev[dayName] || []), { type: '', mealItems: [] }]
    }))
  }

  const updateMeal = (dayName, index, field, value) => {
    setWeekMeals(prev => ({
      ...prev,
      [dayName]: prev[dayName].map((meal, i) => 
        i === index ? { ...meal, [field]: value } : meal
      )
    }))
  }

  const addMealItemToMeal = (dayName, mealIndex, mealItemId) => {
    setWeekMeals(prev => ({
      ...prev,
      [dayName]: prev[dayName].map((meal, i) => {
        if (i === mealIndex) {
          const currentItems = meal.mealItems || []
          if (!currentItems.includes(mealItemId)) {
            return { ...meal, mealItems: [...currentItems, mealItemId] }
          }
        }
        return meal
      })
    }))
  }

  const removeMealItemFromMeal = (dayName, mealIndex, mealItemId) => {
    setWeekMeals(prev => ({
      ...prev,
      [dayName]: prev[dayName].map((meal, i) => {
        if (i === mealIndex) {
          return { ...meal, mealItems: (meal.mealItems || []).filter(id => id !== mealItemId) }
        }
        return meal
      })
    }))
  }

  const removeMeal = (dayName, index) => {
    setWeekMeals(prev => ({
      ...prev,
      [dayName]: prev[dayName].filter((_, i) => i !== index)
    }))
  }

  const handleSavePlan = async () => {
    if (!selectedPlayer || !startDate || weekDays.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Vérifier qu'il y a au moins un repas
    const totalMeals = Object.values(weekMeals).flat().length
    if (totalMeals === 0) {
      toast.error('Veuillez ajouter au moins un repas')
      return
    }

    try {
      // Créer le plan
      const endDate = weekDays[weekDays.length - 1].date
      const plan = await planNutritionService.createPlan({
        player_id: selectedPlayer,
        start_date: startDate,
        end_date: endDate,
        comments: planComments
      })

      // Ajouter tous les repas
      for (const day of weekDays) {
        const dayMeals = weekMeals[day.dayName] || []
        for (const meal of dayMeals) {
          if (meal.type && meal.mealItems && meal.mealItems.length > 0) {
            // Créer le texte des détails à partir des meal items
            const details = meal.mealItems
              .map(itemId => {
                const item = mealItems.find(m => m.id === itemId)
                return item ? item.name : ''
              })
              .filter(Boolean)
              .join(', ')
            
            await planNutritionService.addRepas({
              plan_id: plan.id,
              meal_type_id: meal.type,
              jour_semaine: day.dayName,
              details: details
            })
          }
        }
      }

      toast.success('Plan de nutrition créé avec succès')
      setShowCreateDialog(false)
      resetForm()
      if (selectedPlayerId === selectedPlayer) {
        loadPlayerPlans()
      }
    } catch (error) {
      console.error('Erreur lors de la création du plan:', error)
      toast.error('Erreur lors de la création du plan')
    }
  }

  const resetForm = () => {
    setSelectedPlayer('')
    setStartDate('')
    setWeekDays([])
    setWeekMeals({})
    setPlanComments('')
  }

  const handleViewPlanDetails = async (plan) => {
    try {
      setSelectedPlan(plan)
      const details = await planNutritionService.getPlanDetails(plan.id)
      setPlanDetails(details)
      setShowDetailsDialog(true)
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error)
      toast.error('Erreur lors du chargement des détails')
    }
  }

  const handleDeletePlan = async (planId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return

    try {
      await planNutritionService.deletePlan(planId)
      toast.success('Plan supprimé avec succès')
      loadPlayerPlans()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getMealTypeLabel = (typeValue) => {
    const type = MEAL_TYPES.find(t => t.value === typeValue)
    return type ? `${type.icon} ${type.label}` : typeValue
  }

  const organizedDetails = planNutritionService.organizeRepasByDay(planDetails)
  const selectedPlayerObj = players.find(p => p.id === selectedPlayerId)

  // Calculer les statistiques
  const activePlans = plans.filter(plan => 
    planNutritionService.isActivePlan(plan.start_date, plan.end_date)
  ).length
  const upcomingPlans = plans.filter(plan => {
    const startDate = new Date(plan.start_date)
    const today = new Date()
    return startDate > today
  }).length
  const pastPlans = plans.filter(plan => {
    const endDate = new Date(plan.end_date)
    const today = new Date()
    return endDate < today
  }).length

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-6 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#29BACD] to-[#7BD5E1] bg-clip-text text-transparent">
                  Plans de Nutrition 🥗
                </h1>
                <p className="text-lg text-muted-foreground">Gestion des plans nutritionnels hebdomadaires</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  asChild
                  className="gap-2 shadow-sm hover:shadow-md transition-all"
                >
                  <Link to="/gestion-repas">
                    <ChefHat className="h-4 w-4" />
                    Gérer les repas
                  </Link>
                </Button>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-[#29BACD] to-[#7BD5E1] hover:from-[#1A8A9A] hover:to-[#29BACD] text-white shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Nouveau plan
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-[#29BACD] to-[#7BD5E1]" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Plans</p>
                      <p className="text-3xl font-bold mt-2 text-[#29BACD]">{plans.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">📊 Tous les plans</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#29BACD] to-[#7BD5E1] text-white text-3xl shadow-md">
                      📊
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Plans actifs</p>
                      <p className="text-3xl font-bold mt-2 text-green-600">{activePlans}</p>
                      <p className="text-xs text-muted-foreground mt-1">✅ En cours</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-3xl shadow-md">
                      ✅
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">À venir</p>
                      <p className="text-3xl font-bold mt-2 text-blue-600">{upcomingPlans}</p>
                      <p className="text-xs text-muted-foreground mt-1">🔜 Planifiés</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-3xl shadow-md">
                      🔜
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-slate-500 to-gray-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                      <p className="text-3xl font-bold mt-2 text-slate-600">{pastPlans}</p>
                      <p className="text-xs text-muted-foreground mt-1">📋 Archivés</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 text-white text-3xl shadow-md">
                      📋
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sélection joueur */}
            <PlayerSelector
              selectedPlayerId={selectedPlayerId}
              onPlayerSelect={setSelectedPlayerId}
              lastVisits={visits}
              showCreateButton={false}
            />

            {/* Liste des plans */}
            {selectedPlayerId && (
              <Card className="shadow-lg border-none">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">📋</div>
                    <div>
                      <CardTitle>Plans de nutrition</CardTitle>
                      <CardDescription>
                        {selectedPlayerObj && `${selectedPlayerObj.first_name} ${selectedPlayerObj.last_name}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Filters */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        type="search" 
                        placeholder="🔍 Rechercher un plan..." 
                        className="pl-9 h-11 shadow-sm" 
                      />
                    </div>
                    <Button variant="outline" className="gap-2 h-11 shadow-sm hover:shadow-md transition-all">
                      <Filter className="h-4 w-4" />
                      Filtres
                    </Button>
                  </div>

                  {/* Plans Table */}
                  <div className="rounded-lg border shadow-sm overflow-hidden">
                    {loading ? (
                      <div className="p-12 text-center">
                        <div className="text-6xl mb-4 animate-pulse">🥗</div>
                        <p className="text-muted-foreground">Chargement des plans...</p>
                      </div>
                    ) : plans.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-lg font-medium mb-2">Aucun plan de nutrition</p>
                        <p className="text-sm text-muted-foreground">Les plans apparaîtront ici une fois créés</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="font-semibold">📅 Période</TableHead>
                            <TableHead className="font-semibold">📝 Commentaires</TableHead>
                            <TableHead className="font-semibold">📊 Statut</TableHead>
                            <TableHead className="font-semibold">👨‍⚕️ Créé par</TableHead>
                            <TableHead className="text-right font-semibold">⚙️ Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plans.map((plan) => {
                            const isActive = planNutritionService.isActivePlan(plan.start_date, plan.end_date)
                            const isUpcoming = new Date(plan.start_date) > new Date()
                            return (
                              <TableRow key={plan.id} className="hover:bg-cyan-50/50 transition-colors">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {planNutritionService.formatDateRange(plan.start_date, plan.end_date)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">
                                  {plan.comments || <span className="italic">Aucun commentaire</span>}
                                </TableCell>
                                <TableCell>
                                  {isActive ? (
                                    <Badge className="gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none">
                                      ✅ Actif
                                    </Badge>
                                  ) : isUpcoming ? (
                                    <Badge className="gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none">
                                      🔜 À venir
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="gap-1">
                                      📋 Terminé
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {plan.creator?.first_name} {plan.creator?.last_name}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="gap-2 hover:bg-cyan-50"
                                      onClick={() => handleViewPlanDetails(plan)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      Voir
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeletePlan(plan.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Footer */}
                  {plans.length > 0 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <p>📊 Total: {plans.length} plan{plans.length > 1 ? 's' : ''}</p>
                      <div className="flex gap-4">
                        <p>✅ {activePlans} actif{activePlans > 1 ? 's' : ''}</p>
                        <p>🔜 {upcomingPlans} à venir</p>
                        <p>📋 {pastPlans} terminé{pastPlans > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dialog création plan - DESIGN PREMIUM */}
            <Dialog open={showCreateDialog} onOpenChange={(open) => {
              setShowCreateDialog(open)
              if (!open) resetForm()
            }}>
              <DialogContent className="sm:max-w-[1400px] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-white to-gray-50">
                {/* HEADER PREMIUM */}
                <div className="sticky top-0 z-50 relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 shadow-xl">
                  <div className="absolute inset-0 bg-black/5"></div>
                  <DialogHeader className="relative p-8 text-white">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
                        <Plus className="h-10 w-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-white text-3xl font-extrabold mb-3 tracking-tight drop-shadow-lg">
                          Créer un plan de nutrition hebdomadaire
                        </h2>
                        <p className="text-white text-base font-semibold opacity-95">
                          Sélectionnez une date de début et planifiez les repas pour chaque jour de la semaine
                        </p>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
                
                {/* CONTENU SCROLLABLE PREMIUM */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Informations du plan - Section Premium */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                        <span className="text-xl">🎯</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Informations du plan</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Sélection du joueur */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          Joueur
                          <Badge className="bg-red-500 text-white text-xs">Obligatoire</Badge>
                        </Label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                          <SelectTrigger className="h-16 text-lg border-3 border-gray-300 focus:border-cyan-500 rounded-2xl px-6 font-medium shadow-sm">
                            <SelectValue placeholder="🔍 Sélectionner un joueur..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {players.map((player) => (
                              <SelectItem key={player.id} value={player.id} className="text-lg py-4 font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm font-bold">
                                    {player.first_name?.[0]}
                                  </div>
                                  <span>{player.first_name} {player.last_name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date de début */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          Date de début
                          <Badge className="bg-red-500 text-white text-xs">Obligatoire</Badge>
                        </Label>
                        <Input
                          type="date"
                          className="h-16 text-lg border-3 border-gray-300 focus:border-cyan-500 rounded-2xl px-6 font-medium shadow-sm"
                          value={startDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                        />
                        <p className="text-sm text-gray-600">La semaine complète (7 jours) sera générée automatiquement</p>
                      </div>
                    </div>

                    {/* Commentaires */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <span className="text-xl">📝</span>
                        </div>
                        <Label className="text-base font-semibold text-gray-700">Commentaires sur le plan</Label>
                      </div>
                      <Textarea
                        className="min-h-[120px] text-lg border-3 border-gray-300 focus:border-purple-500 rounded-2xl px-6 py-4 font-medium shadow-sm resize-none"
                        value={planComments}
                        onChange={(e) => setPlanComments(e.target.value)}
                        placeholder="Ex: Plan de prise de masse, Plan pré-compétition, Objectifs spécifiques..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Planification des repas - Section Premium */}
                  {weekDays.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <span className="text-xl">📅</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Planification des repas</h3>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none text-sm px-3 py-1">
                          {weekDays.length} jours
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {weekDays.map((day) => (
                          <Card key={day.dayName} className="border-3 border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <CardHeader className="pb-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-gray-100">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg font-bold capitalize flex items-center gap-2 text-gray-800">
                                    <span className="text-2xl">📆</span>
                                    {day.displayDate}
                                  </CardTitle>
                                  <CardDescription className="text-sm mt-1 font-medium text-gray-600">{day.date}</CardDescription>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => addMealToDay(day.dayName)}
                                  className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span className="font-semibold">Repas</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                              {weekMeals[day.dayName]?.length === 0 ? (
                                <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-2xl border-3 border-dashed border-gray-300">
                                  <div className="text-4xl mb-3">🍽️</div>
                                  <p className="text-base font-medium text-gray-600">Aucun repas planifié</p>
                                  <p className="text-sm text-gray-500 mt-1">Cliquez sur &quot;Repas&quot; pour ajouter</p>
                                </div>
                              ) : (
                                weekMeals[day.dayName]?.map((meal, index) => (
                                  <div key={index} className="space-y-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border-3 border-cyan-200 shadow-md hover:shadow-lg transition-all">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                                        <span className="text-lg">🍴</span>
                                        Type de repas
                                      </Label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMeal(day.dayName, index)}
                                        className="h-8 w-8 p-0 hover:bg-red-100 rounded-full transition-all"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                    <Select
                                      value={meal.type}
                                      onValueChange={(value) => updateMeal(day.dayName, index, 'type', value)}
                                    >
                                      <SelectTrigger className="h-12 bg-white border-3 border-gray-300 focus:border-cyan-500 rounded-xl font-medium">
                                        <SelectValue placeholder="🍴 Sélectionner le type..." />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-xl">
                                        {MEAL_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value} className="text-base py-3 font-medium">
                                            <span className="text-xl mr-3">{type.icon}</span>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <div>
                                      <Label className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                                        <span className="text-lg">➕</span>
                                        Choisir des repas
                                      </Label>
                                      <Select
                                        onValueChange={(value) => addMealItemToMeal(day.dayName, index, value)}
                                      >
                                        <SelectTrigger className="h-12 bg-white border-3 border-gray-300 focus:border-cyan-500 rounded-xl font-medium">
                                          <SelectValue placeholder="➕ Ajouter un repas..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                          {mealItems
                                            .filter(item => !meal.type || item.meal_type_id === meal.type)
                                            .map((item) => (
                                              <SelectItem key={item.id} value={item.id} className="text-base py-3 font-medium">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-lg">🍽️</span>
                                                  <span>{item.name}</span>
                                                  {item.category && (
                                                    <Badge className="ml-2 text-xs bg-cyan-100 text-cyan-700">
                                                      {item.category}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {meal.mealItems && meal.mealItems.length > 0 && (
                                      <div className="space-y-2 pt-3">
                                        <Label className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                                          <span className="text-lg">📋</span>
                                          Repas sélectionnés ({meal.mealItems.length})
                                        </Label>
                                        <div className="space-y-2">
                                          {meal.mealItems.map((itemId) => {
                                            const item = mealItems.find(m => m.id === itemId)
                                            return item ? (
                                              <div key={itemId} className="flex items-center justify-between bg-white p-3 rounded-xl border-2 border-gray-200 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md">
                                                <div className="flex items-center gap-3">
                                                  <span className="text-lg">🍽️</span>
                                                  <span className="font-semibold text-gray-800">{item.name}</span>
                                                  {item.category && (
                                                    <Badge className="text-xs bg-gray-100 text-gray-600">
                                                      {item.category}
                                                    </Badge>
                                                  )}
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeMealItemFromMeal(day.dayName, index, itemId)}
                                                  className="h-8 w-8 p-0 hover:bg-red-50 rounded-full transition-all"
                                                >
                                                  <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                              </div>
                                            ) : null
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {weekDays.length === 0 && (
                    <div className="relative overflow-hidden rounded-2xl border-3 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
                      <div className="relative p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl">
                          <span className="text-4xl">📅</span>
                        </div>
                        <h4 className="text-2xl font-black text-gray-800 mb-3">Aucune date sélectionnée</h4>
                        <p className="text-lg font-semibold text-gray-600 mb-2">
                          Sélectionnez une date de début pour générer automatiquement les 7 jours de la semaine
                        </p>
                        <p className="text-base text-gray-500">
                          La planification des repas apparaîtra ici une fois la date choisie
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER PREMIUM */}
                <div className="sticky bottom-0 z-50 border-t-3 border-gray-200 bg-white p-8 shadow-2xl">
                  <DialogFooter className="gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                      className="h-16 px-10 text-lg font-bold border-3 border-gray-300 hover:bg-gray-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                    >
                      ❌ Annuler
                    </Button>
                    <Button 
                      onClick={handleSavePlan}
                      className="h-16 px-12 text-lg font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Save className="h-6 w-6 mr-3" />
                      ✨ Créer le plan de nutrition
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog détails du plan */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogContent className="max-w-[1920px] w-[99vw] max-h-[98vh] overflow-y-auto">
                <DialogHeader className="space-y-4 pb-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                      <Eye className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-bold">Détails du plan de nutrition</DialogTitle>
                      <DialogDescription className="text-lg mt-2">
                        📅 {selectedPlan && planNutritionService.formatDateRange(selectedPlan.start_date, selectedPlan.end_date)}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {selectedPlan?.comments && (
                    <Card className="border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-cyan-100">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span>💬</span>
                          Commentaires
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700">{selectedPlan.comments}</p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {(() => {
                      // Générer les 7 jours du plan à partir de la date de début
                      if (!selectedPlan) return null;
                      const planWeekDays = generateWeekDays(selectedPlan.start_date);
                      
                      return planWeekDays.map((day) => {
                        const dayMeals = organizedDetails[day.dayName] || []
                        return (
                          <Card key={day.dayName} className="border-2 border-slate-200 hover:border-cyan-300 transition-all hover:shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50">
                              <CardTitle className="text-base capitalize flex items-center gap-2">
                                <span>📆</span>
                                {day.displayDate}
                              </CardTitle>
                              <CardDescription className="text-xs">{day.date}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                              {dayMeals.length === 0 ? (
                                <div className="text-center py-6 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border-2 border-dashed border-cyan-200">
                                  <p className="text-sm text-muted-foreground italic">🍽️ Aucun repas planifié</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {dayMeals.map((repas) => (
                                    <div key={repas.id} className="p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg border-2 border-cyan-200 shadow-sm hover:shadow-md transition-all">
                                      <div className="font-semibold text-cyan-700 flex items-center gap-1">
                                        {getMealTypeLabel(repas.meal_type_id)}
                                      </div>
                                      <p className="text-sm text-gray-700 mt-2 bg-white/50 p-2 rounded">{repas.details}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })
                    })()}
                  </div>
                </div>
                <DialogFooter className="pt-8 border-t">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="gap-3 h-14 px-8 text-lg font-semibold">
                    Fermer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
