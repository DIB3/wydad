import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModernFormField } from '@/components/ModernFormField'
import { Save, Apple, Utensils, Droplet, Flame, Activity, ArrowRight, Target, Paperclip, PieChart, Coffee, Moon } from 'lucide-react'
import {
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import nutritionService from '../services/nutrition.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { useFormPersistence } from '../hooks/useFormPersistence'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'

export function NutritionForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  
  // Obtenir les infos de progression multi-modules
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })

  const [formData, setFormData] = useState({
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_type: '',
    kcal_target: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    hydration_l: '',
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
    pre_match_meal: '',
    post_match_meal: '',
    allergies: '',
    comments: ''
  })

  // Charger les données Nutrition existantes
  useEffect(() => {
    const fetchExistingNutrition = async () => {
      if (visitId) {
        try {
          const nutritionData = await nutritionService.getByVisitId(visitId)
          
          if (nutritionData && Object.keys(nutritionData).length > 0) {
            const newFormData = {
              consultation_date: nutritionData.consultation_date || new Date().toISOString().split('T')[0],
              consultation_type: nutritionData.consultation_type || '',
              kcal_target: nutritionData.kcal_target || '',
              protein_g: nutritionData.protein_g || '',
              carbs_g: nutritionData.carbs_g || '',
              fat_g: nutritionData.fat_g || '',
              hydration_l: nutritionData.hydration_l || '',
              breakfast: nutritionData.breakfast || '',
              lunch: nutritionData.lunch || '',
              dinner: nutritionData.dinner || '',
              snacks: nutritionData.snacks || '',
              pre_match_meal: nutritionData.pre_match_meal || '',
              post_match_meal: nutritionData.post_match_meal || '',
              allergies: nutritionData.allergies || '',
              comments: nutritionData.comments || ''
            }
            setFormData(newFormData)
            toast.success('Données Nutrition chargées avec succès')
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error('❌ Erreur lors du chargement des données Nutrition:', error)
            toast.error('Erreur lors du chargement des données')
          }
        }
      }
    }
    fetchExistingNutrition()
  }, [visitId])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('nutrition', formData, setFormData, visitId)

  const cleanFormData = (data) => {
    const cleaned = {}
    Object.keys(data).forEach(key => {
      const value = data[key]
      if (value === '') {
        cleaned[key] = null
      } else if (value !== null && value !== undefined) {
        cleaned[key] = value
      }
    })
    return cleaned
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!visitId) {
      toast.error('ID de visite manquant')
      return
    }

    try {
      setLoading(true)
      const cleanedData = cleanFormData(formData)
      
      // Vérifier si les données existent déjà
      try {
        await nutritionService.getByVisitId(visitId)
        await nutritionService.update(visitId, cleanedData)
        toast.success('Plan nutrition mis à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          await nutritionService.create(visitId, cleanedData)
          toast.success('Plan nutrition enregistré avec succès !')
        } else {
          throw error
        }
      }
      
      // Utiliser la navigation intelligente multi-modules
      handleModuleNavigation({ navigate, moduleSequence, currentModuleIndex, playerId })
    } catch (error) {
      console.error('Erreur:', error)
      console.error('Détails:', error.response?.data)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!visitId) {
      toast.error('ID de visite manquant')
      return
    }

    try {
      setLoading(true)
      const cleanedData = cleanFormData(formData)
      
      // Vérifier si les données existent déjà
      try {
        await nutritionService.getByVisitId(visitId)
        await nutritionService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          await nutritionService.create(visitId, cleanedData)
          toast.success('Brouillon enregistré !')
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      console.error('Détails:', error.response?.data)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement du brouillon')
    } finally {
      setLoading(false)
    }
  }

  // Fonctions pour générer les données des graphiques dynamiquement
  const getMacronutrimentsData = () => {
    const data = []
    
    if (formData.protein_g) {
      data.push({
        name: 'Protéines',
        value: parseFloat(formData.protein_g),
        color: '#ef4444',
        unit: 'g/kg/j'
      })
    }
    
    if (formData.carbs_g) {
      data.push({
        name: 'Glucides',
        value: parseFloat(formData.carbs_g),
        color: '#f59e0b',
        unit: 'g/kg/j'
      })
    }
    
    if (formData.fat_g) {
      data.push({
        name: 'Lipides',
        value: parseFloat(formData.fat_g),
        color: '#fbbf24',
        unit: 'g/kg/j'
      })
    }
    
    return data
  }

  const getCaloriesDistributionData = () => {
    // Calories par macronutriment (protéines: 4kcal/g, glucides: 4kcal/g, lipides: 9kcal/g)
    const data = []
    
    if (formData.protein_g) {
      const proteinKcal = parseFloat(formData.protein_g) * 4
      data.push({
        name: 'Protéines',
        kcal: proteinKcal,
        color: '#ef4444'
      })
    }
    
    if (formData.carbs_g) {
      const carbsKcal = parseFloat(formData.carbs_g) * 4
      data.push({
        name: 'Glucides',
        kcal: carbsKcal,
        color: '#f59e0b'
      })
    }
    
    if (formData.fat_g) {
      const fatKcal = parseFloat(formData.fat_g) * 9
      data.push({
        name: 'Lipides',
        kcal: fatKcal,
        color: '#fbbf24'
      })
    }
    
    return data
  }

  const getNutritionalBalanceData = () => {
    const data = []
    
    // Score calories (optimal: 2500-3500 kcal pour sportifs)
    if (formData.kcal_target) {
      const caloriesValue = parseFloat(formData.kcal_target)
      const caloriesScore = caloriesValue >= 2500 && caloriesValue <= 3500 ? 100 :
                            Math.max(0, 100 - Math.abs(caloriesValue - 3000) / 30)
      data.push({ axe: 'Calories', value: Math.min(caloriesScore, 100), fullMark: 100 })
    }
    
    // Score protéines (optimal: 1.6-2.2 g/kg/j)
    if (formData.protein_g) {
      const proteinValue = parseFloat(formData.protein_g)
      const proteinScore = proteinValue >= 1.6 && proteinValue <= 2.2 ? 100 :
                           Math.max(0, 100 - Math.abs(proteinValue - 1.9) * 30)
      data.push({ axe: 'Protéines', value: Math.min(proteinScore, 100), fullMark: 100 })
    }
    
    // Score glucides (optimal: 5-7 g/kg/j)
    if (formData.carbs_g) {
      const carbsValue = parseFloat(formData.carbs_g)
      const carbsScore = carbsValue >= 5 && carbsValue <= 7 ? 100 :
                         Math.max(0, 100 - Math.abs(carbsValue - 6) * 15)
      data.push({ axe: 'Glucides', value: Math.min(carbsScore, 100), fullMark: 100 })
    }
    
    // Score lipides (optimal: 1-1.5 g/kg/j)
    if (formData.fat_g) {
      const fatValue = parseFloat(formData.fat_g)
      const fatScore = fatValue >= 1 && fatValue <= 1.5 ? 100 :
                       Math.max(0, 100 - Math.abs(fatValue - 1.25) * 40)
      data.push({ axe: 'Lipides', value: Math.min(fatScore, 100), fullMark: 100 })
    }
    
    // Score hydratation (optimal: 3-4 L/j)
    if (formData.hydration_l) {
      const hydrationValue = parseFloat(formData.hydration_l)
      const hydrationScore = hydrationValue >= 3 && hydrationValue <= 4 ? 100 :
                             Math.max(0, 100 - Math.abs(hydrationValue - 3.5) * 25)
      data.push({ axe: 'Hydratation', value: Math.min(hydrationScore, 100), fullMark: 100 })
    }
    
    return data
  }

  const getHydrationData = () => {
    if (!formData.hydration_l) return []
    
    const hydrationValue = parseFloat(formData.hydration_l)
    const targetMin = 3
    const targetMax = 4
    
    return [{
      type: 'Apport actuel',
      litres: hydrationValue,
      color: hydrationValue >= targetMin && hydrationValue <= targetMax ? '#22c55e' : 
             hydrationValue < targetMin ? '#f59e0b' : '#3b82f6'
    }]
  }

  const COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6']

  return (
    <form className="space-y-6">
      {/* Indicateur de progression multi-modules */}
      <ModuleProgressIndicator 
        moduleProgress={moduleProgress}
        moduleSequence={moduleSequence}
        currentModuleIndex={currentModuleIndex}
      />
      
      {/* Consultation Info */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
              <Apple className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Informations de consultation</CardTitle>
              <CardDescription>Contexte de la consultation nutritionnelle</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2 group">
            <Label htmlFor="consultation-date" className="text-sm font-semibold text-slate-700 group-focus-within:text-orange-600 transition-colors">
              Date de consultation <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="consultation-date" 
              type="date"
              value={formData.consultation_date}
              onChange={(e) => handleChange('consultation_date', e.target.value)}
              className="h-12 border-2 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all"
              required 
            />
          </div>
        </CardContent>
      </Card>

      {/* Dietary Assessment */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Évaluation alimentaire</CardTitle>
              <CardDescription>Analyse des apports nutritionnels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ModernFormField 
              label="Apport calorique estimé" 
              icon={Flame}
              id="calories" 
              unit="kcal/j" 
              placeholder="2800" 
              gradient="from-orange-500 to-red-500"
              value={formData.kcal_target}
              onChange={(e) => handleChange('kcal_target', e.target.value)}
            />
            <ModernFormField 
              label="Apport hydrique" 
              icon={Droplet}
              id="hydration" 
              unit="L/j" 
              placeholder="3.5" 
              gradient="from-blue-500 to-cyan-500"
              value={formData.hydration_l}
              onChange={(e) => handleChange('hydration_l', e.target.value)}
              step="0.1" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Répartition macronutriments
            </Label>
            <div className="grid gap-6 md:grid-cols-3">
              <ModernFormField 
                label="Protéines" 
                icon={Activity}
                id="protein" 
                unit="g/kg/j" 
                placeholder="1.8" 
                gradient="from-red-500 to-pink-500"
                value={formData.protein_g}
                onChange={(e) => handleChange('protein_g', e.target.value)}
                step="0.1" 
              />
              <ModernFormField 
                label="Glucides" 
                icon={Flame}
                id="carbs" 
                unit="g/kg/j" 
                placeholder="6" 
                gradient="from-yellow-500 to-orange-500"
                value={formData.carbs_g}
                onChange={(e) => handleChange('carbs_g', e.target.value)}
                step="0.1" 
              />
              <ModernFormField 
                label="Lipides" 
                icon={Droplet}
                id="fats" 
                unit="g/kg/j" 
                placeholder="1.2" 
                gradient="from-amber-500 to-yellow-500"
                value={formData.fat_g}
                onChange={(e) => handleChange('fat_g', e.target.value)}
                step="0.1" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nutritional Goals */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Objectifs nutritionnels</CardTitle>
              <CardDescription>Plan et objectifs personnalisés</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2 group">
            <Label htmlFor="goals" className="text-sm font-semibold text-slate-700 group-focus-within:text-green-600 transition-colors">
              Objectifs <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.consultation_type} onValueChange={(value) => handleChange('consultation_type', value)}>
              <SelectTrigger id="goals" className="h-12 border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="maintain" className="cursor-pointer">⚖️ Maintien du poids</SelectItem>
                <SelectItem value="gain" className="cursor-pointer">💪 Prise de masse</SelectItem>
                <SelectItem value="lose" className="cursor-pointer">📉 Perte de poids</SelectItem>
                <SelectItem value="performance" className="cursor-pointer">🚀 Optimisation performance</SelectItem>
                <SelectItem value="recovery" className="cursor-pointer">🔄 Amélioration récupération</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-details" className="text-sm font-semibold text-slate-700">
              Détails des objectifs
            </Label>
            <Textarea 
              id="goal-details" 
              placeholder="Objectifs spécifiques et échéances..." 
              rows={3}
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-sm font-semibold text-slate-700">
              Allergies alimentaires
            </Label>
            <Textarea 
              id="allergies" 
              placeholder="Allergies et intolérances..." 
              rows={2}
              value={formData.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Repas quotidiens */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Plan de repas quotidien</CardTitle>
              <CardDescription>Détail des repas et collations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="breakfast" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Coffee className="h-4 w-4 text-orange-500" />
                Petit déjeuner
              </Label>
              <Textarea
                id="breakfast"
                placeholder="Ex: Flocons d'avoine, fruits, œufs, pain complet..."
                value={formData.breakfast}
                onChange={(e) => handleChange('breakfast', e.target.value)}
                rows={3}
                className="border-2 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lunch" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-green-500" />
                Déjeuner
              </Label>
              <Textarea
                id="lunch"
                placeholder="Ex: Poulet grillé, riz complet, légumes, salade..."
                value={formData.lunch}
                onChange={(e) => handleChange('lunch', e.target.value)}
                rows={3}
                className="border-2 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dinner" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                Dîner
              </Label>
              <Textarea
                id="dinner"
                placeholder="Ex: Poisson, quinoa, légumes vapeur..."
                value={formData.dinner}
                onChange={(e) => handleChange('dinner', e.target.value)}
                rows={3}
                className="border-2 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="snacks" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Apple className="h-4 w-4 text-red-500" />
                Collations
              </Label>
              <Textarea
                id="snacks"
                placeholder="Ex: Fruits, noix, yaourt, barres énergétiques..."
                value={formData.snacks}
                onChange={(e) => handleChange('snacks', e.target.value)}
                rows={3}
                className="border-2 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repas de match */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Nutrition de match</CardTitle>
              <CardDescription>Repas avant et après la compétition</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 p-6">
          <div className="space-y-2">
            <Label htmlFor="pre-match" className="text-sm font-semibold text-slate-700">
              Repas pré-match (H-3)
            </Label>
            <Textarea
              id="pre-match"
              placeholder="Ex: Pâtes, poulet, banane, eau..."
              value={formData.pre_match_meal}
              onChange={(e) => handleChange('pre_match_meal', e.target.value)}
              rows={3}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-match" className="text-sm font-semibold text-slate-700">
              Repas post-match (H+2)
            </Label>
            <Textarea
              id="post-match"
              placeholder="Ex: Protéines, glucides rapides, réhydratation..."
              value={formData.post_match_meal}
              onChange={(e) => handleChange('post_match_meal', e.target.value)}
              rows={3}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Graphiques dynamiques en temps réel */}
      {(getMacronutrimentsData().length > 0 || getCaloriesDistributionData().length > 0 || getNutritionalBalanceData().length > 0 || getHydrationData().length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 pt-4">
            <PieChart className="h-6 w-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-slate-800">Analyses en temps réel</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Répartition macronutriments (Pie Chart) */}
            {getMacronutrimentsData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-yellow-500" />
                <CardHeader className="bg-gradient-to-r from-red-50 to-yellow-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 text-white">
                      <PieChart className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Macronutriments</CardTitle>
                      <CardDescription>Répartition protéines/glucides/lipides</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={getMacronutrimentsData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                        label={(entry) => `${entry.name}: ${entry.value}${entry.unit}`}
                      >
                        {getMacronutrimentsData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #f59e0b',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [`${value} ${props.payload.unit}`, props.payload.name]}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Distribution calorique (Bar Chart) */}
            {getCaloriesDistributionData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Distribution calorique</CardTitle>
                      <CardDescription>Calories par macronutriment</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getCaloriesDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <YAxis 
                        label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748b' } }}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #f97316',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [`${value.toFixed(0)} kcal`, props.payload.name]}
                      />
                      <Bar 
                        dataKey="kcal" 
                        radius={[8, 8, 0, 0]}
                        name="Calories"
                      >
                        {getCaloriesDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Balance nutritionnelle (Radar) */}
            {getNutritionalBalanceData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Balance nutritionnelle</CardTitle>
                      <CardDescription>Score d'équilibre alimentaire</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getNutritionalBalanceData()}>
                      <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
                      <PolarAngleAxis 
                        dataKey="axe" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Radar 
                        name="Score" 
                        dataKey="value" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.5}
                        strokeWidth={3}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #10b981',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Score optimal']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Hydratation (Bar) */}
            {getHydrationData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                      <Droplet className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Hydratation quotidienne</CardTitle>
                      <CardDescription>Apport hydrique journalier</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getHydrationData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="type" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <YAxis 
                        label={{ value: 'Litres', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748b' } }}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        domain={[0, 5]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #06b6d4',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value) => [`${value} L/jour`, 'Hydratation']}
                      />
                      <Bar 
                        dataKey="litres" 
                        radius={[8, 8, 0, 0]}
                        name="Litres"
                      >
                        {getHydrationData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-xs text-center">
                    <p className="text-slate-600">✨ Graphique mis à jour en temps réel avec vos données</p>
                    <p className="text-slate-500 mt-2">
                      🟢 Optimal: 3-4L | 🟡 Insuffisant: &lt;3L | 🔵 Élevé: &gt;4L
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Documents et pièces jointes */}
      {visitId && (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Documents et pièces jointes</CardTitle>
                <CardDescription>Plans de repas, analyses nutritionnelles et recommandations alimentaires</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FileUpload 
              entityType="visit_nutrition"
              entityId={visitId}
              onUploadSuccess={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              entityType="visit_nutrition"
              entityId={visitId}
              refreshTrigger={refreshFiles}
              onDelete={() => setRefreshFiles(prev => prev + 1)}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
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
          className="gap-2 h-11 rounded-xl border-2 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 transition-all"
          onClick={handleSaveDraft}
          disabled={loading}
        >
          <Save className="h-4 w-4" />
          {loading ? 'Enregistrement...' : 'Enregistrer brouillon'}
        </Button>
        <Button 
          type="submit" 
          className="gap-2 h-11 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span>{loading ? 'Validation...' : 'Valider la consultation'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}
