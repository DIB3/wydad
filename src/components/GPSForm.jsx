import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModernFormField } from '@/components/ModernFormField'
import { Upload, Save, FileSpreadsheet, Navigation, Zap, TrendingUp, Timer, Target, ArrowRight, MapPin, Activity, Paperclip, Heart, BarChart3 } from 'lucide-react'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import gpsService from '../services/gps.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'
import { useFormPersistence } from '../hooks/useFormPersistence'

export function GPSForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  
  // Obtenir les infos de progression multi-modules
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })

  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0], // Date actuelle par défaut
    session_type: '',
    surface: '',
    duration_min: '',
    distance_m: '',
    hid_m: '',
    hsd_m: '',
    vmax_kmh: '',
    sprints_count: '',
    acc_gt3_count: '',
    decel_hard_count: '',
    player_load: '',
    avg_speed_kmh: '',
    max_heart_rate_bpm: '',
    avg_heart_rate_bpm: '',
    recovery_index: '',
    notes: ''
  })

  // Charger les données GPS existantes
  useEffect(() => {
    const fetchExistingGPS = async () => {
      if (visitId) {
        try {
          const gpsData = await gpsService.getByVisitId(visitId)
          
          if (gpsData && Object.keys(gpsData).length > 0) {
            setFormData({
              session_date: gpsData.session_date || new Date().toISOString().split('T')[0],
              session_type: gpsData.session_type || '',
              surface: gpsData.surface || '',
              duration_min: gpsData.duration_min || '',
              distance_m: gpsData.distance_m || '',
              hid_m: gpsData.hid_m || '',
              hsd_m: gpsData.hsd_m || '',
              vmax_kmh: gpsData.vmax_kmh || '',
              sprints_count: gpsData.sprints_count || '',
              acc_gt3_count: gpsData.acc_gt3_count || '',
              decel_hard_count: gpsData.decel_hard_count || '',
              player_load: gpsData.player_load || '',
              avg_speed_kmh: gpsData.avg_speed_kmh || '',
              max_heart_rate_bpm: gpsData.max_heart_rate_bpm || '',
              avg_heart_rate_bpm: gpsData.avg_heart_rate_bpm || '',
              recovery_index: gpsData.recovery_index || '',
              notes: gpsData.notes || ''
            })
            toast.success('Données GPS chargées avec succès')
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error('❌ Erreur lors du chargement des données GPS:', error)
            toast.error('Erreur lors du chargement des données')
          }
        }
      }
    }
    fetchExistingGPS()
  }, [visitId])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('gps', formData, setFormData, visitId)

  const cleanFormData = (data) => {
    const cleaned = {}
    Object.keys(data).forEach(key => {
      const value = data[key]
      // Ne pas envoyer les valeurs vides (laisser le backend utiliser les valeurs par défaut)
      if (value !== '' && value !== null && value !== undefined) {
        // Convertir les nombres string en nombres
        if (['duration_min', 'distance_m', 'hid_m', 'hsd_m', 'vmax_kmh', 'sprints_count', 
             'acc_gt3_count', 'decel_hard_count', 'player_load', 'avg_speed_kmh', 
             'max_heart_rate_bpm', 'avg_heart_rate_bpm', 'recovery_index'].includes(key)) {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            cleaned[key] = numValue
          }
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
        await gpsService.getByVisitId(visitId)
        // Les données existent, on fait un update
        await gpsService.update(visitId, cleanedData)
        toast.success('Données GPS mises à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          // Les données n'existent pas, on les crée
          await gpsService.create(visitId, cleanedData)
          toast.success('Données GPS enregistrées avec succès !')
        } else {
          throw error
        }
      }
      
      // Utiliser la navigation intelligente multi-modules
      handleModuleNavigation({ navigate, moduleSequence, currentModuleIndex, playerId })
    } catch (error) {
      console.error('❌ [GPS Form] Erreur:', error)
      console.error('❌ [GPS Form] Détails:', error.response?.data)
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
        await gpsService.getByVisitId(visitId)
        // Les données existent, on fait un update
        await gpsService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          // Les données n'existent pas, on les crée
          await gpsService.create(visitId, cleanedData)
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
  const getPerformanceRadarData = () => {
    const data = []
    
    // Distance totale (score sur 100, max 12km = 100%)
    if (formData.distance_m) {
      const distanceScore = Math.min((parseFloat(formData.distance_m) / 12000) * 100, 100)
      data.push({ axe: 'Distance totale', value: distanceScore, fullMark: 100 })
    }
    
    // HID (score sur 100, max 1200m = 100%)
    if (formData.hid_m) {
      const hidScore = Math.min((parseFloat(formData.hid_m) / 1200) * 100, 100)
      data.push({ axe: 'HID', value: hidScore, fullMark: 100 })
    }
    
    // HSD (score sur 100, max 600m = 100%)
    if (formData.hsd_m) {
      const hsdScore = Math.min((parseFloat(formData.hsd_m) / 600) * 100, 100)
      data.push({ axe: 'HSD', value: hsdScore, fullMark: 100 })
    }
    
    // Vitesse max (score sur 100, max 36km/h = 100%)
    if (formData.vmax_kmh) {
      const vmaxScore = Math.min((parseFloat(formData.vmax_kmh) / 36) * 100, 100)
      data.push({ axe: 'Vitesse max', value: vmaxScore, fullMark: 100 })
    }
    
    // Sprints (score sur 100, max 25 sprints = 100%)
    if (formData.sprints_count) {
      const sprintsScore = Math.min((parseFloat(formData.sprints_count) / 25) * 100, 100)
      data.push({ axe: 'Sprints', value: sprintsScore, fullMark: 100 })
    }
    
    // Accélérations (score sur 100, max 30 acc = 100%)
    if (formData.acc_gt3_count) {
      const accScore = Math.min((parseFloat(formData.acc_gt3_count) / 30) * 100, 100)
      data.push({ axe: 'Accélérations', value: accScore, fullMark: 100 })
    }
    
    return data
  }

  const getDistanceDistributionData = () => {
    const data = []
    
    if (formData.distance_m) {
      data.push({
        categorie: 'Distance totale',
        valeur: parseFloat(formData.distance_m),
        unite: 'm',
        color: '#10b981'
      })
    }
    
    if (formData.hid_m) {
      data.push({
        categorie: 'HID',
        valeur: parseFloat(formData.hid_m),
        unite: 'm',
        color: '#f59e0b'
      })
    }
    
    if (formData.hsd_m) {
      data.push({
        categorie: 'HSD',
        valeur: parseFloat(formData.hsd_m),
        unite: 'm',
        color: '#ef4444'
      })
    }
    
    return data
  }

  const getIntenseEffortsData = () => {
    const data = []
    
    if (formData.sprints_count) {
      data.push({
        type: 'Sprints',
        nombre: parseFloat(formData.sprints_count)
      })
    }
    
    if (formData.acc_gt3_count) {
      data.push({
        type: 'Accélérations >3m/s²',
        nombre: parseFloat(formData.acc_gt3_count)
      })
    }
    
    if (formData.decel_hard_count) {
      data.push({
        type: 'Décélérations dures',
        nombre: parseFloat(formData.decel_hard_count)
      })
    }
    
    return data
  }

  const getSpeedHeartRateData = () => {
    const data = []
    
    if (formData.vmax_kmh) {
      data.push({
        parametre: 'Vitesse max',
        valeur: parseFloat(formData.vmax_kmh),
        unite: 'km/h',
        max: 40
      })
    }
    
    if (formData.avg_speed_kmh) {
      data.push({
        parametre: 'Vitesse moy.',
        valeur: parseFloat(formData.avg_speed_kmh),
        unite: 'km/h',
        max: 15
      })
    }
    
    if (formData.max_heart_rate_bpm) {
      data.push({
        parametre: 'FC max',
        valeur: parseFloat(formData.max_heart_rate_bpm),
        unite: 'bpm',
        max: 220
      })
    }
    
    if (formData.avg_heart_rate_bpm) {
      data.push({
        parametre: 'FC moy.',
        valeur: parseFloat(formData.avg_heart_rate_bpm),
        unite: 'bpm',
        max: 200
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
      
      {/* Session Info */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Informations de la session</CardTitle>
              <CardDescription>Type et contexte de l'activité</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 group">
              <Label htmlFor="session-type" className="text-sm font-semibold text-slate-700 group-focus-within:text-green-600 transition-colors flex items-center gap-2">
                Type de session <span className="text-red-500">*</span>
                {formData.session_type && <span className="text-xl">{formData.session_type === 'match' ? '⚽' : '🏃'}</span>}
              </Label>
              <Select value={formData.session_type} onValueChange={(value) => handleChange('session_type', value)}>
                <SelectTrigger id="session-type" className="h-12 border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="match" className="cursor-pointer">⚽ Match</SelectItem>
                  <SelectItem value="training" className="cursor-pointer">🏃 Entraînement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="surface" className="text-sm font-semibold text-slate-700 group-focus-within:text-green-600 transition-colors">
                Surface <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.surface} onValueChange={(value) => handleChange('surface', value)}>
                <SelectTrigger id="surface" className="h-12 border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="grass" className="cursor-pointer">🌱 Pelouse naturelle</SelectItem>
                  <SelectItem value="synthetic" className="cursor-pointer">🟢 Pelouse synthétique</SelectItem>
                  <SelectItem value="indoor" className="cursor-pointer">🏢 Salle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 group">
              <Label htmlFor="session-date" className="text-sm font-semibold text-slate-700 group-focus-within:text-green-600 transition-colors">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="session_date" 
                type="date" 
                value={formData.session_date}
                onChange={(e) => handleChange('session_date', e.target.value)}
                className="h-12 border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
              />
            </div>
          <ModernFormField 
            label="Durée" 
            icon={Timer}
            id="duration" 
            unit="min" 
            placeholder="90" 
            gradient="from-green-500 to-emerald-500"
            value={formData.duration_min}
            onChange={(e) => handleChange('duration_min', e.target.value)}
            max="999999"
            required 
          />
          </div>
        </CardContent>
      </Card>

      {/* Distance & Speed */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Distance et vitesse</CardTitle>
              <CardDescription>Données de performance physique</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
          <ModernFormField 
            label="Distance totale" 
            icon={MapPin}
            id="distance" 
            unit="km" 
            placeholder="10.2" 
            gradient="from-emerald-500 to-teal-500"
            value={formData.distance_m}
            onChange={(e) => handleChange('distance_m', e.target.value)}
            step="0.1" 
            required 
          />
          <ModernFormField 
            label="High Intensity Distance" 
            icon={TrendingUp}
            id="hid" 
            unit="m" 
            placeholder="850" 
            gradient="from-green-500 to-emerald-500"
            value={formData.hid_m}
            onChange={(e) => handleChange('hid_m', e.target.value)}
            step="1" 
            required 
          />
          <ModernFormField 
            label="High Speed Distance" 
            icon={Zap}
            id="hsd" 
            unit="m" 
            placeholder="420" 
            gradient="from-teal-500 to-cyan-500"
            value={formData.hsd_m}
            onChange={(e) => handleChange('hsd_m', e.target.value)}
            step="1" 
            required 
          />
          <ModernFormField 
            label="Vitesse maximale" 
            icon={Zap}
            id="vmax" 
            unit="km/h" 
            placeholder="32.1" 
            gradient="from-yellow-500 to-orange-500"
            value={formData.vmax_kmh}
            onChange={(e) => handleChange('vmax_kmh', e.target.value)}
            step="0.1" 
            required 
          />
          <ModernFormField 
            label="Vitesse moyenne" 
            icon={Activity}
            id="vmoy" 
            unit="km/h" 
            placeholder="8.5" 
            gradient="from-green-500 to-teal-500"
            value={formData.avg_speed_kmh}
            onChange={(e) => handleChange('avg_speed_kmh', e.target.value)}
            step="0.1" 
            required 
          />
          <ModernFormField 
            label="Nombre de sprints" 
            icon={Target}
            id="sprints" 
            unit="" 
            placeholder="18" 
            gradient="from-orange-500 to-red-500"
            value={formData.sprints_count}
            onChange={(e) => handleChange('sprints_count', e.target.value)}
            required 
          />
        </CardContent>
      </Card>

      {/* Efforts intenses */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Efforts intenses</CardTitle>
              <CardDescription>Accélérations, décélérations et charge</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 p-6">
          <ModernFormField 
            label="Accélérations >3m/s²" 
            icon={Zap}
            id="acc-gt3" 
            unit="" 
            placeholder="42" 
            gradient="from-orange-500 to-red-500"
            value={formData.acc_gt3_count}
            onChange={(e) => handleChange('acc_gt3_count', e.target.value)}
          />
          <ModernFormField 
            label="Décélérations dures" 
            icon={TrendingUp}
            id="decel-hard" 
            unit="" 
            placeholder="38" 
            gradient="from-red-500 to-pink-500"
            value={formData.decel_hard_count}
            onChange={(e) => handleChange('decel_hard_count', e.target.value)}
          />
          <ModernFormField 
            label="Player Load" 
            icon={Activity}
            id="player-load" 
            unit="" 
            placeholder="485" 
            gradient="from-purple-500 to-indigo-500"
            value={formData.player_load}
            onChange={(e) => handleChange('player_load', e.target.value)}
            step="0.1"
          />
          <ModernFormField 
            label="Indice de récupération" 
            icon={TrendingUp}
            id="recovery-index" 
            unit="" 
            placeholder="8.2" 
            gradient="from-blue-500 to-cyan-500"
            value={formData.recovery_index}
            onChange={(e) => handleChange('recovery_index', e.target.value)}
            step="0.1"
          />
        </CardContent>
      </Card>

      {/* Fréquence cardiaque */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Fréquence cardiaque</CardTitle>
              <CardDescription>Données cardiaques pendant l'effort</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 p-6">
          <ModernFormField 
            label="FC maximale" 
            icon={Heart}
            id="max-hr" 
            unit="bpm" 
            placeholder="195" 
            gradient="from-red-500 to-pink-500"
            value={formData.max_heart_rate_bpm}
            onChange={(e) => handleChange('max_heart_rate_bpm', e.target.value)}
          />
          <ModernFormField 
            label="FC moyenne" 
            icon={Activity}
            id="avg-hr" 
            unit="bpm" 
            placeholder="165" 
            gradient="from-pink-500 to-rose-500"
            value={formData.avg_heart_rate_bpm}
            onChange={(e) => handleChange('avg_heart_rate_bpm', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Graphiques dynamiques en temps réel */}
      {(getPerformanceRadarData().length > 0 || getDistanceDistributionData().length > 0 || getIntenseEffortsData().length > 0 || getSpeedHeartRateData().length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 pt-4">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-800">Analyses en temps réel</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance globale (Radar) */}
            {getPerformanceRadarData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Performance globale</CardTitle>
                      <CardDescription>Score de performance physique</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getPerformanceRadarData()}>
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
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Score']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Distribution des distances (Bar) */}
            {getDistanceDistributionData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Distribution des distances</CardTitle>
                      <CardDescription>Répartition des efforts par intensité</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getDistanceDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="categorie" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #10b981',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [
                          `${value} ${props.payload.unite}`, 
                          props.payload.categorie
                        ]}
                      />
                      <Bar 
                        dataKey="valeur" 
                        radius={[8, 8, 0, 0]}
                        name="Distance"
                      >
                        {getDistanceDistributionData().map((entry, index) => (
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

            {/* Efforts intenses (Bar) */}
            {getIntenseEffortsData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Efforts intenses</CardTitle>
                      <CardDescription>Sprints, accélérations et décélérations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getIntenseEffortsData()} layout="vertical">
                      <defs>
                        <linearGradient id="effortsGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis 
                        dataKey="type" 
                        type="category" 
                        width={150} 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #f97316',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value) => [value, 'Nombre']}
                      />
                      <Bar 
                        dataKey="nombre" 
                        fill="url(#effortsGradient)"
                        radius={[0, 8, 8, 0]}
                        name="Nombre d'efforts"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Vitesse et fréquence cardiaque (Bar) */}
            {getSpeedHeartRateData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-pink-500" />
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Vitesse & Fréquence cardiaque</CardTitle>
                      <CardDescription>Paramètres physiologiques de l'effort</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSpeedHeartRateData()}>
                      <defs>
                        <linearGradient id="heartSpeedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#ec4899" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="parametre" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #ef4444',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [
                          `${value} ${props.payload.unite}`, 
                          props.payload.parametre
                        ]}
                      />
                      <Bar 
                        dataKey="valeur" 
                        fill="url(#heartSpeedGradient)"
                        radius={[8, 8, 0, 0]}
                        name="Valeur"
                      />
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
              placeholder="Observations générales sur la session..." 
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents et pièces jointes */}
      {visitId && (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Documents et pièces jointes</CardTitle>
                <CardDescription>Rapports GPS, analyses de performance et données d'entraînement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FileUpload 
              entityType="visit_gps"
              entityId={visitId}
              onUploadSuccess={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              entityType="visit_gps"
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
          className="gap-2 h-11 rounded-xl border-2 hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-all"
          onClick={handleSaveDraft}
          disabled={loading}
        >
          <Save className="h-4 w-4" />
          {loading ? 'Enregistrement...' : 'Enregistrer brouillon'}
        </Button>
        <Button 
          type="submit" 
          className="gap-2 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span>{loading ? 'Validation...' : 'Valider la session GPS'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}

