import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModernFormField } from '@/components/ModernFormField'
import { Save, Plus, Trash2, Apple, Utensils, Droplet, Flame, Scale, Ruler, Weight, Activity, ArrowRight, Target, TrendingUp, Paperclip } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import nutritionService from '../services/nutrition.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { useFormPersistence } from '../hooks/useFormPersistence'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'

// Données d'exemple pour les graphiques nutrition
const weightEvolutionData = [
  { mois: 'Jan', poids: 72.5, imc: 22.3 },
  { mois: 'Fév', poids: 73.2, imc: 22.5 },
  { mois: 'Mar', poids: 73.8, imc: 22.7 },
  { mois: 'Avr', poids: 74.0, imc: 22.8 },
  { mois: 'Mai', poids: 74.2, imc: 22.9 },
  { mois: 'Juin', poids: 74.0, imc: 22.8 },
]

const macronutrientsData = [
  { name: 'Protéines', value: 25, color: '#ef4444', grammes: 700 },
  { name: 'Glucides', value: 55, color: '#3b82f6', grammes: 1540 },
  { name: 'Lipides', value: 20, color: '#f59e0b', grammes: 560 },
]

const caloriesData = [
  { jour: 'Lun', cible: 2800, réel: 2750 },
  { jour: 'Mar', cible: 2800, réel: 2900 },
  { jour: 'Mer', cible: 2800, réel: 2700 },
  { jour: 'Jeu', cible: 2800, réel: 2850 },
  { jour: 'Ven', cible: 2800, réel: 2950 },
  { jour: 'Sam', cible: 3000, réel: 3100 },
  { jour: 'Dim', cible: 2600, réel: 2550 },
]

const hydrationData = [
  { jour: 'Lun', litres: 3.2 },
  { jour: 'Mar', litres: 3.5 },
  { jour: 'Mer', litres: 3.8 },
  { jour: 'Jeu', litres: 3.3 },
  { jour: 'Ven', litres: 3.6 },
  { jour: 'Sam', litres: 4.0 },
  { jour: 'Dim', litres: 3.0 },
]

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
          console.log('🔍 Chargement des données Nutrition existantes pour visitId:', visitId)
          const nutritionData = await nutritionService.getByVisitId(visitId)
          
          if (nutritionData && Object.keys(nutritionData).length > 0) {
            console.log('✅ Données Nutrition trouvées:', nutritionData)
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
            console.log('📝 Nouveau formData à définir:', newFormData)
            setFormData(newFormData)
            console.log('✨ FormData mis à jour')
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
          <div className="grid gap-6 md:grid-cols-2">
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
            <div className="space-y-2 group">
              <Label htmlFor="consultation-type" className="text-sm font-semibold text-slate-700 group-focus-within:text-orange-600 transition-colors">
                Type de consultation <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.consultation_type} onValueChange={(value) => handleChange('consultation_type', value)}>
                <SelectTrigger id="consultation-type" className="h-12 border-2 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="initial" className="cursor-pointer">📋 Initiale</SelectItem>
                  <SelectItem value="followup" className="cursor-pointer">🔄 Suivi</SelectItem>
                  <SelectItem value="preseason" className="cursor-pointer">🏃 Pré-saison</SelectItem>
                  <SelectItem value="competition" className="cursor-pointer">🏆 Compétition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note: Section Anthropométrie masquée - Ces données sont disponibles dans le module Impédance */}
      {/* Les données de poids, taille, IMC, composition corporelle doivent être saisies dans l'Impédancemétrie */}

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
          <div className="space-y-2">
            <Label htmlFor="eating-habits" className="text-sm font-semibold text-slate-700">
              Habitudes alimentaires
            </Label>
            <Textarea 
              id="eating-habits" 
              placeholder="Nombre de repas, horaires, préférences..." 
              rows={4}
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              className="border-2 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all resize-none"
            />
          </div>

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
            <Select>
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
              value={formData.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Graphiques statistiques Nutrition */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Évolution du poids */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Évolution du poids</CardTitle>
                <CardDescription>6 derniers mois</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightEvolutionData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="mois" className="text-xs" stroke="#64748b" />
                <YAxis domain={[72, 75]} className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="poids" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#weightGradient)"
                  dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  name="Poids (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition macronutriments */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <Apple className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Macronutriments</CardTitle>
                <CardDescription>Répartition actuelle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macronutrientsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macronutrientsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #f97316',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Apport calorique */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-yellow-500" />
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Apport calorique</CardTitle>
                <CardDescription>Objectif vs Réel (7 derniers jours)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={caloriesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="jour" className="text-xs" stroke="#64748b" />
                <YAxis className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #f59e0b',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="cible" fill="#cbd5e1" radius={[8, 8, 0, 0]} name="Cible (kcal)" />
                <Bar dataKey="réel" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Réel (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hydratation */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                <Droplet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Hydratation</CardTitle>
                <CardDescription>Consommation d&apos;eau quotidienne</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hydrationData}>
                <defs>
                  <linearGradient id="hydrationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="jour" className="text-xs" stroke="#64748b" />
                <YAxis domain={[0, 5]} className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #06b6d4',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="litres" fill="url(#hydrationGradient)" radius={[8, 8, 0, 0]} name="Litres" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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

