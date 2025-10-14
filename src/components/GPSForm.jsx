import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModernFormField } from '@/components/ModernFormField'
import { Upload, Save, FileSpreadsheet, Navigation, Zap, TrendingUp, Timer, Target, ArrowRight, MapPin, Activity, Paperclip } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import gpsService from '../services/gps.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'
import { useFormPersistence } from '../hooks/useFormPersistence'

// Données d'exemple pour les graphiques GPS
const distanceHistoryData = [
  { session: 'S1', distance: 8.5, hid: 750, hsd: 380 },
  { session: 'S2', distance: 10.2, hid: 850, hsd: 420 },
  { session: 'S3', distance: 9.1, hid: 800, hsd: 400 },
  { session: 'S4', distance: 11.5, hid: 920, hsd: 480 },
  { session: 'S5', distance: 9.8, hid: 840, hsd: 410 },
  { session: 'S6', distance: 10.5, hid: 880, hsd: 450 },
]

const vitesseData = [
  { session: 'S1', vmax: 30.5, vmoy: 8.2 },
  { session: 'S2', vmax: 32.1, vmoy: 8.5 },
  { session: 'S3', vmax: 31.2, vmoy: 8.3 },
  { session: 'S4', vmax: 33.5, vmoy: 9.1 },
  { session: 'S5', vmax: 31.8, vmoy: 8.6 },
  { session: 'S6', vmax: 32.5, vmoy: 8.7 },
]

const chargeData = [
  { session: 'S1', accel: 25, decel: 28, sprints: 15, playerLoad: 450 },
  { session: 'S2', accel: 28, decel: 32, sprints: 18, playerLoad: 485 },
  { session: 'S3', accel: 26, decel: 30, sprints: 16, playerLoad: 460 },
  { session: 'S4', accel: 30, decel: 35, sprints: 20, playerLoad: 510 },
  { session: 'S5', accel: 27, decel: 31, sprints: 17, playerLoad: 470 },
  { session: 'S6', accel: 29, decel: 33, sprints: 19, playerLoad: 495 },
]

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
          console.log('🔍 Chargement des données GPS existantes pour visitId:', visitId)
          const gpsData = await gpsService.getByVisitId(visitId)
          
          if (gpsData && Object.keys(gpsData).length > 0) {
            console.log('✅ Données GPS trouvées:', gpsData)
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

      {/* Graphiques statistiques GPS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Évolution des distances */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Évolution des distances</CardTitle>
                <CardDescription>6 dernières sessions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={distanceHistoryData}>
                <defs>
                  <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="session" className="text-xs" stroke="#64748b" />
                <YAxis className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #10b981',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="distance" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#distanceGradient)"
                  name="Distance (km)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vitesses */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Vitesses</CardTitle>
                <CardDescription>Vmax et Vmoy par session</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={vitesseData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="session" className="text-xs" stroke="#64748b" />
                <YAxis className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #06b6d4',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vmax" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  name="Vmax (km/h)"
                />
                <Line 
                  type="monotone" 
                  dataKey="vmoy" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  name="Vmoy (km/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charge physique */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden md:col-span-2">
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Charge physique</CardTitle>
                <CardDescription>Accélérations, décélérations et sprints</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chargeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="session" className="text-xs" stroke="#64748b" />
                <YAxis className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #a855f7',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="accel" fill="#a855f7" radius={[8, 8, 0, 0]} name="Accélérations" />
                <Bar dataKey="decel" fill="#ec4899" radius={[8, 8, 0, 0]} name="Décélérations" />
                <Bar dataKey="sprints" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Sprints" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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

