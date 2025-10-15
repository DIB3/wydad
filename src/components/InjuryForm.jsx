import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModernFormField } from '@/components/ModernFormField'
import { Save, AlertCircle, Target, Clock, ArrowRight, FileSpreadsheet, Paperclip, Plus, Activity, Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis, Cell
} from 'recharts'
import { Checkbox } from '@/components/ui/checkbox'
import injuriesService from '../services/injuries.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { useFormPersistence } from '../hooks/useFormPersistence'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'

export function InjuryForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  
  // Obtenir les infos de progression multi-modules
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })

  const [formData, setFormData] = useState({
    injury_date: new Date().toISOString().split('T')[0], // Date actuelle par défaut
    type: '',
    severity: '',
    location: '',
    side: '',
    mechanism: '',
    circumstance: '',
    description: '',
    pain_level: '',
    treatment: '',
    immobilization: false,
    surgery: false,
    recovery_status: '',
    estimated_duration_days: '',
    next_evaluation: '',
    return_planned: '',
    return_actual: '',
    notes: ''
  })

  // Charger les données Blessure existantes
  useEffect(() => {
    const fetchExistingInjury = async () => {
      if (visitId) {
        try {
          const injuryData = await injuriesService.getByVisitId(visitId)
          
          if (injuryData && Object.keys(injuryData).length > 0) {
            setFormData(prevData => ({
              ...prevData,
              injury_date: injuryData.injury_date || new Date().toISOString().split('T')[0],
              type: injuryData.type || '',
              severity: injuryData.severity || '',
              location: injuryData.location || '',
              side: injuryData.side || '',
              mechanism: injuryData.mechanism || '',
              circumstance: injuryData.circumstance || '',
              description: injuryData.description || '',
              pain_level: injuryData.pain_level || '',
              treatment: injuryData.treatment || '',
              immobilization: injuryData.immobilization || false,
              surgery: injuryData.surgery || false,
              recovery_status: injuryData.recovery_status || '',
              estimated_duration_days: injuryData.estimated_duration_days || '',
              next_evaluation: injuryData.next_evaluation || '',
              return_planned: injuryData.return_planned || '',
              return_actual: injuryData.return_actual || '',
              notes: injuryData.notes || ''
            }))
            toast.success('Données Blessure chargées avec succès')
          }
        } catch (error) {
          if (error.response?.status === 404) {
            toast.info('Nouvelle blessure - Remplissez le formulaire')
          } else {
            console.error('❌ Erreur lors du chargement des données Blessure:', error)
            toast.error('Erreur lors du chargement des données')
          }
        }
      }
    }
    fetchExistingInjury()
  }, [visitId])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('injury', formData, setFormData, visitId)

  const cleanFormData = (data) => {
    const cleaned = {}
    Object.keys(data).forEach(key => {
      const value = data[key]
      // Convertir les chaînes vides en null
      if (value === '') {
        cleaned[key] = null
      } else if (value !== null && value !== undefined) {
        // Convertir pain_level et estimated_duration_days en nombres avec validation
        if (key === 'pain_level') {
          const numValue = parseInt(value)
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            cleaned[key] = numValue
          } else {
            cleaned[key] = null
          }
        } else if (key === 'estimated_duration_days') {
          const numValue = parseInt(value)
          cleaned[key] = !isNaN(numValue) && numValue >= 0 ? numValue : null
        } else {
        cleaned[key] = value
        }
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
        await injuriesService.getByVisitId(visitId)
        await injuriesService.update(visitId, cleanedData)
        toast.success('Blessure mise à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          await injuriesService.create(visitId, cleanedData)
          toast.success('Blessure enregistrée avec succès !')
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
        await injuriesService.getByVisitId(visitId)
        await injuriesService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          await injuriesService.create(visitId, cleanedData)
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
  const getSeverityData = () => {
    if (!formData.severity) return []
    
    const severityLevels = {
      'legere': { value: 33, label: 'Légère', color: '#22c55e' },
      'moderee': { value: 66, label: 'Modérée', color: '#f59e0b' },
      'severe': { value: 100, label: 'Sévère', color: '#ef4444' }
    }
    
    const current = severityLevels[formData.severity]
    if (!current) return []
    
    return [{
      name: current.label,
      value: current.value,
      fill: current.color
    }]
  }

  const getPainLevelData = () => {
    if (!formData.pain_level) return []
    
    const painValue = parseInt(formData.pain_level)
    const painPercentage = (painValue / 10) * 100
    
    return [{
      name: `Douleur ${painValue}/10`,
      value: painPercentage,
      fill: painValue <= 3 ? '#22c55e' : painValue <= 6 ? '#f59e0b' : '#ef4444'
    }]
  }

  const getRecoveryTimelineData = () => {
    const data = []
    
    if (formData.injury_date) {
      data.push({
        event: 'Blessure',
        date: formData.injury_date,
        type: 'injury',
        color: '#ef4444'
      })
    }
    
    if (formData.next_evaluation) {
      data.push({
        event: 'Évaluation',
        date: formData.next_evaluation,
        type: 'evaluation',
        color: '#f59e0b'
      })
    }
    
    if (formData.return_planned) {
      data.push({
        event: 'Retour prévu',
        date: formData.return_planned,
        type: 'planned',
        color: '#3b82f6'
      })
    }
    
    if (formData.return_actual) {
      data.push({
        event: 'Retour effectif',
        date: formData.return_actual,
        type: 'actual',
        color: '#22c55e'
      })
    }
    
    // Calculer les jours depuis la blessure pour chaque événement
    if (formData.injury_date) {
      const injuryDate = new Date(formData.injury_date)
      data.forEach(item => {
        const eventDate = new Date(item.date)
        const diffTime = eventDate - injuryDate
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        item.days = Math.max(0, diffDays)
      })
    }
    
    return data
  }

  const getTreatmentStatusData = () => {
    const data = []
    
    if (formData.immobilization !== undefined) {
      data.push({
        traitement: 'Immobilisation',
        status: formData.immobilization ? 1 : 0,
        color: formData.immobilization ? '#3b82f6' : '#e2e8f0'
      })
    }
    
    if (formData.surgery !== undefined) {
      data.push({
        traitement: 'Chirurgie',
        status: formData.surgery ? 1 : 0,
        color: formData.surgery ? '#ef4444' : '#e2e8f0'
      })
    }
    
    if (formData.estimated_duration_days) {
      const currentDate = new Date()
      const injuryDate = new Date(formData.injury_date)
      const daysSinceInjury = Math.ceil((currentDate - injuryDate) / (1000 * 60 * 60 * 24))
      const progressPercent = Math.min((daysSinceInjury / parseInt(formData.estimated_duration_days)) * 100, 100)
      
      data.push({
        traitement: 'Progression',
        status: progressPercent / 100,
        color: progressPercent < 100 ? '#f59e0b' : '#22c55e',
        label: `${Math.round(progressPercent)}%`
      })
    }
    
    return data
  }

  return (
    <form className="space-y-6">
      {/* Indicateur de progression multi-modules */}
      <ModuleProgressIndicator 
        moduleProgress={moduleProgress}
        moduleSequence={moduleSequence}
        currentModuleIndex={currentModuleIndex}
      />

      {/* Bandeau d'information si formulaire vide */}
      {visitId && !formData.type && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Nouvelle blessure à enregistrer</p>
                <p className="text-sm text-blue-700 mt-1">
                  Cette visite n&apos;a pas encore de données de blessure. Remplissez le formulaire ci-dessous pour enregistrer les informations de la blessure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Injury Details */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Détails de la blessure</CardTitle>
              <CardDescription>Informations sur l&apos;incident</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 group">
              <Label htmlFor="injury-date" className="text-sm font-semibold text-slate-700 group-focus-within:text-red-600 transition-colors">
                Date de la blessure <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="injury_date" 
                type="date" 
                value={formData.injury_date}
                onChange={(e) => handleChange('injury_date', e.target.value)}
                className="h-12 border-2 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                required 
              />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="injury-context" className="text-sm font-semibold text-slate-700 group-focus-within:text-red-600 transition-colors">
                Contexte <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.circumstance} onValueChange={(value) => handleChange('circumstance', value)}>
                <SelectTrigger id="injury-context" className="h-12 border-2 focus:border-red-500 focus:ring-red-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="match" className="cursor-pointer">⚽ Match</SelectItem>
                  <SelectItem value="training" className="cursor-pointer">🏃 Entraînement</SelectItem>
                  <SelectItem value="other" className="cursor-pointer">📋 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 group">
              <Label htmlFor="injury-type" className="text-sm font-semibold text-slate-700 group-focus-within:text-red-600 transition-colors">
                Type de blessure <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger id="injury-type" className="h-12 border-2 focus:border-red-500 focus:ring-red-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="muscle" className="cursor-pointer">💪 Musculaire</SelectItem>
                  <SelectItem value="ligament" className="cursor-pointer">🔗 Ligamentaire</SelectItem>
                  <SelectItem value="tendon" className="cursor-pointer">⚡ Tendineuse</SelectItem>
                  <SelectItem value="bone" className="cursor-pointer">🦴 Osseuse</SelectItem>
                  <SelectItem value="joint" className="cursor-pointer">🔄 Articulaire</SelectItem>
                  <SelectItem value="contusion" className="cursor-pointer">🔵 Contusion</SelectItem>
                  <SelectItem value="other" className="cursor-pointer">📋 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="body-part" className="text-sm font-semibold text-slate-700 group-focus-within:text-red-600 transition-colors">
                Partie du corps <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.location} onValueChange={(value) => handleChange('location', value)}>
                <SelectTrigger id="body-part" className="h-12 border-2 focus:border-red-500 focus:ring-red-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="head" className="cursor-pointer">🧠 Tête</SelectItem>
                  <SelectItem value="neck" className="cursor-pointer">🦴 Cou</SelectItem>
                  <SelectItem value="shoulder" className="cursor-pointer">💪 Épaule</SelectItem>
                  <SelectItem value="knee" className="cursor-pointer">🦵 Genou</SelectItem>
                  <SelectItem value="ankle" className="cursor-pointer">🦶 Cheville</SelectItem>
                  <SelectItem value="foot" className="cursor-pointer">👟 Pied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mechanism" className="text-sm font-semibold text-slate-700">
              Mécanisme de la blessure
            </Label>
            <Textarea 
              id="mechanism" 
              placeholder="Description du mécanisme lésionnel..." 
              value={formData.mechanism}
              onChange={(e) => handleChange('mechanism', e.target.value)}
              rows={3}
              className="border-2 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all resize-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2 group">
              <Label htmlFor="severity" className="text-sm font-semibold text-slate-700 group-focus-within:text-red-600 transition-colors">
                Gravité <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.severity} onValueChange={(value) => handleChange('severity', value)}>
                <SelectTrigger id="severity" className="h-12 border-2 focus:border-red-500 focus:ring-red-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="legere" className="cursor-pointer">🟢 Légère</SelectItem>
                  <SelectItem value="moderee" className="cursor-pointer">🟡 Modérée</SelectItem>
                  <SelectItem value="severe" className="cursor-pointer">🔴 Sévère</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="side" className="text-sm font-semibold text-slate-700 group-focus-within:text-red-600 transition-colors">
                Côté
              </Label>
              <Select value={formData.side} onValueChange={(value) => handleChange('side', value)}>
                <SelectTrigger id="side" className="h-12 border-2 focus:border-red-500 focus:ring-red-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="G" className="cursor-pointer">⬅️ Gauche</SelectItem>
                  <SelectItem value="D" className="cursor-pointer">➡️ Droit</SelectItem>
                  <SelectItem value="NA" className="cursor-pointer">↕️ Non applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ModernFormField 
              label="Niveau de douleur" 
              icon={AlertCircle}
              id="pain-level" 
              unit="/10" 
              placeholder="7" 
              gradient="from-red-500 to-orange-500"
              value={formData.pain_level}
              onChange={(e) => handleChange('pain_level', e.target.value)}
              min={0}
              max={10}
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="recovery-status" className="text-sm font-semibold text-slate-700 group-focus-within:text-orange-600 transition-colors">
              Statut de récupération
            </Label>
            <Select value={formData.recovery_status} onValueChange={(value) => handleChange('recovery_status', value)}>
              <SelectTrigger id="recovery-status" className="h-12 border-2 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="en_cours" className="cursor-pointer">🔴 En cours de traitement</SelectItem>
                <SelectItem value="reeducation" className="cursor-pointer">🟡 En rééducation</SelectItem>
                <SelectItem value="retour_partiel" className="cursor-pointer">🟠 Retour partiel</SelectItem>
                <SelectItem value="retour_complet" className="cursor-pointer">🟢 Retour complet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Plan */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Plan de traitement</CardTitle>
              <CardDescription>Soins et protocole de récupération</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="treatment" className="text-sm font-semibold text-slate-700">
              Traitement prescrit
            </Label>
            <Textarea 
              id="treatment" 
              placeholder="Repos, glace, kinésithérapie, médicaments..." 
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              rows={4}
              className="border-2 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all resize-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ModernFormField 
              label="Durée estimée d'arrêt" 
              icon={Clock}
              id="estimated-duration" 
              unit="jours" 
              placeholder="14" 
              gradient="from-orange-500 to-red-500"
              value={formData.estimated_duration_days}
              onChange={(e) => handleChange('estimated_duration_days', e.target.value)}
            />
            <div className="space-y-2 group">
              <Label htmlFor="next-evaluation" className="text-sm font-semibold text-slate-700 group-focus-within:text-orange-600 transition-colors">
                Prochaine évaluation
              </Label>
              <Input 
                id="next-evaluation" 
                type="date"
                value={formData.next_evaluation}
                onChange={(e) => handleChange('next_evaluation', e.target.value)}
                className="h-12 border-2 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="return_planned" className="text-sm font-semibold text-slate-700 group-focus-within:text-green-600 transition-colors">
              Date de retour prévue
            </Label>
            <Input 
              id="return_planned" 
              type="date"
              value={formData.return_planned}
              onChange={(e) => handleChange('return_planned', e.target.value)}
              className="h-12 border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
            />
          </div>
          
          <div className="space-y-2 group">
            <Label htmlFor="return_actual" className="text-sm font-semibold text-slate-700 group-focus-within:text-green-600 transition-colors">
              Date de retour réelle
            </Label>
            <Input 
              id="return_actual" 
              type="date"
              value={formData.return_actual}
              onChange={(e) => handleChange('return_actual', e.target.value)}
              className="h-12 border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
              <Checkbox
                id="immobilization"
                checked={formData.immobilization}
                onCheckedChange={(checked) => handleChange('immobilization', checked)}
                className="w-6 h-6"
              />
              <Label htmlFor="immobilization" className="text-sm font-semibold text-blue-900 cursor-pointer">
                🩹 Immobilisation nécessaire
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-red-200 bg-red-50/50 hover:bg-red-100/50 transition-colors">
              <Checkbox
                id="surgery"
                checked={formData.surgery}
                onCheckedChange={(checked) => handleChange('surgery', checked)}
                className="w-6 h-6"
              />
              <Label htmlFor="surgery" className="text-sm font-semibold text-red-900 cursor-pointer">
                🏥 Chirurgie requise
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques dynamiques en temps réel */}
      {(getSeverityData().length > 0 || getPainLevelData().length > 0 || getRecoveryTimelineData().length > 0 || getTreatmentStatusData().length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 pt-4">
            <Activity className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-slate-800">Analyses en temps réel</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Niveau de gravité (Radial Bar) */}
            {getSeverityData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Niveau de gravité</CardTitle>
                      <CardDescription>Évaluation de la sévérité</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="90%" 
                      data={getSeverityData()}
                      startAngle={180}
                      endAngle={0}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar 
                        background 
                        dataKey="value" 
                        cornerRadius={10}
                        fill={getSeverityData()[0]?.fill}
                      />
                      <text 
                        x="50%" 
                        y="50%" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        className="text-3xl font-bold"
                        fill={getSeverityData()[0]?.fill}
                      >
                        {getSeverityData()[0]?.name}
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Niveau de douleur (Radial Bar) */}
            {getPainLevelData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Niveau de douleur</CardTitle>
                      <CardDescription>Échelle de 0 à 10</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="90%" 
                      data={getPainLevelData()}
                      startAngle={180}
                      endAngle={0}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar 
                        background 
                        dataKey="value" 
                        cornerRadius={10}
                        fill={getPainLevelData()[0]?.fill}
                      />
                      <text 
                        x="50%" 
                        y="50%" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        className="text-3xl font-bold"
                        fill={getPainLevelData()[0]?.fill}
                      >
                        {formData.pain_level}/10
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Timeline de récupération (Bar) */}
            {getRecoveryTimelineData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden md:col-span-2">
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-green-500" />
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 text-white">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Timeline de récupération</CardTitle>
                      <CardDescription>Jalons et événements clés</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getRecoveryTimelineData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="event" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <YAxis 
                        label={{ value: 'Jours depuis la blessure', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748b' } }}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #3b82f6',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [
                          `J+${value} - ${props.payload.date}`, 
                          props.payload.event
                        ]}
                      />
                      <Bar 
                        dataKey="days" 
                        radius={[8, 8, 0, 0]}
                        name="Jours"
                      >
                        {getRecoveryTimelineData().map((entry, index) => (
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

            {/* Statut du traitement (Bar horizontal) */}
            {getTreatmentStatusData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden md:col-span-2">
                <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Statut du traitement</CardTitle>
                      <CardDescription>Interventions et progression de la récupération</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getTreatmentStatusData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        type="number" 
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis 
                        dataKey="traitement" 
                        type="category" 
                        width={120} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #8b5cf6',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [
                          props.payload.label || (value === 1 ? 'Oui' : 'Non'), 
                          props.payload.traitement
                        ]}
                      />
                      <Bar 
                        dataKey="status" 
                        radius={[0, 8, 8, 0]}
                        name="Statut"
                      >
                        {getTreatmentStatusData().map((entry, index) => (
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
          </div>
        </div>
      )}

      {/* Notes */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-slate-500 to-gray-500" />
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-500 text-white">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Observations additionnelles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
              Notes additionnelles
            </Label>
            <Textarea 
              id="notes" 
              placeholder="Observations complémentaires sur la blessure et le traitement..." 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="border-2 focus:border-slate-500 focus:ring-slate-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents et pièces jointes */}
      {visitId && (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Documents et pièces jointes</CardTitle>
                <CardDescription>Photos, radiographies, IRM, rapports médicaux et plans de traitement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FileUpload 
              entityType="visit_injury"
              entityId={visitId}
              onUploadSuccess={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              entityType="visit_injury"
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
          className="gap-2 h-11 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span>{loading ? 'Enregistrement...' : 'Enregistrer la blessure'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}

