import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModernFormField } from '@/components/ModernFormField'
import { Upload, Save, AlertCircle, Target, Clock, Activity, ArrowRight, Plus, TrendingUp, FileText, FileSpreadsheet, Paperclip } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import injuriesService from '../services/injuries.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { useFormPersistence } from '../hooks/useFormPersistence'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'

// Données d'exemple pour les graphiques de blessures
const injuryByTypeData = [
  { name: 'Musculaire', value: 45, color: '#ef4444' },
  { name: 'Ligamentaire', value: 25, color: '#f97316' },
  { name: 'Tendineuse', value: 15, color: '#f59e0b' },
  { name: 'Articulaire', value: 10, color: '#eab308' },
  { name: 'Autre', value: 5, color: '#84cc16' },
]

const injuryBySeverityData = [
  { gravité: 'Mineure', nombre: 8, durée: 5 },
  { gravité: 'Modérée', nombre: 5, durée: 18 },
  { gravité: 'Sévère', nombre: 2, durée: 45 },
]

const recoveryTimelineData = [
  { semaine: 'S1', douleur: 8, mobilité: 30 },
  { semaine: 'S2', douleur: 6, mobilité: 50 },
  { semaine: 'S3', douleur: 4, mobilité: 70 },
  { semaine: 'S4', douleur: 2, mobilité: 85 },
  { semaine: 'S5', douleur: 1, mobilité: 95 },
]

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
          console.log('🔍 Chargement des données Blessure existantes pour visitId:', visitId)
          const injuryData = await injuriesService.getByVisitId(visitId)
          
          if (injuryData && Object.keys(injuryData).length > 0) {
            console.log('✅ Données Blessure trouvées:', injuryData)
            setFormData({
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
            })
            toast.success('Données Blessure chargées avec succès')
          }
        } catch (error) {
          if (error.response?.status !== 404) {
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

  return (
    <form className="space-y-6">
      {/* Indicateur de progression multi-modules */}
      <ModuleProgressIndicator 
        moduleProgress={moduleProgress}
        moduleSequence={moduleSequence}
        currentModuleIndex={currentModuleIndex}
      />
      
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
              <CardDescription>Informations sur l'incident</CardDescription>
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
        </CardContent>
      </Card>

      {/* Graphiques statistiques Blessures */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Blessures par type */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Répartition par type</CardTitle>
                <CardDescription>Historique des blessures</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={injuryByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {injuryByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #ef4444',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gravité et durée */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Gravité et durée</CardTitle>
                <CardDescription>Temps d&apos;arrêt moyen par gravité</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={injuryBySeverityData}>
                <defs>
                  <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="gravité" className="text-xs" stroke="#64748b" />
                <YAxis className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #f97316',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="durée" fill="url(#severityGradient)" radius={[8, 8, 0, 0]} name="Durée (jours)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline de récupération */}
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden md:col-span-2">
          <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Timeline de récupération</CardTitle>
                <CardDescription>Évolution douleur et mobilité</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={recoveryTimelineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="semaine" className="text-xs" stroke="#64748b" />
                <YAxis className="text-xs" stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '2px solid #10b981',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="douleur" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  name="Douleur (/10)"
                />
                <Line 
                  type="monotone" 
                  dataKey="mobilité" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  name="Mobilité (%)"
                />
              </LineChart>
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

