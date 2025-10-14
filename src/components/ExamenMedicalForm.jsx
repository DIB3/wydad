import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ModernFormField } from '@/components/ModernFormField'
import { 
  Save, ArrowRight, Stethoscope, Heart, Thermometer,
  Activity, FileText, Pill, Calendar, AlertCircle
} from 'lucide-react'
import examenMedicalService from '../services/examenMedical.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'
import { useFormPersistence } from '../hooks/useFormPersistence'

export function ExamenMedicalForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })

  const [formData, setFormData] = useState({
    date_consultation: new Date().toISOString().split('T')[0],
    type_consultation: 'controle',
    motif: '',
    symptomes: '',
    diagnostic: '',
    temperature_c: '',
    tension_arterielle: '',
    frequence_cardiaque_bpm: '',
    examens_demandes: '',
    traitement: '',
    recommandations: '',
    date_suivi: '',
    statut: 'brouillon',
    
    // Examens demandés (checkboxes)
    examen_sang: false,
    examen_ecg: false,
    examen_echo: false,
    examen_scanner: false,
    examen_irm: false,
    examen_autres: false,
    
    // Symptômes (checkboxes)
    symptome_fievre: false,
    symptome_toux: false,
    symptome_douleurs: false,
    symptome_maux_tete: false,
    symptome_diarrhee: false,
    symptome_vomissements: false,
    symptome_fatigue: false,
    symptome_allergies: false,
    symptome_malaise: false,
    symptome_rhume: false,
    symptome_autres: false
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('examen_medical', formData, setFormData, visitId)

  // Charger les données existantes au montage
  useEffect(() => {
    const fetchExistingExamen = async () => {
      if (!visitId) return
      
      try {
        const data = await examenMedicalService.getByVisitId(visitId)
        
        // Convertir tous les null en chaînes vides pour les inputs React
        const cleanedData = {}
        Object.keys(data).forEach(key => {
          cleanedData[key] = data[key] === null ? '' : data[key]
        })
        
        // Parser les symptômes depuis la string
        if (data.symptomes && typeof data.symptomes === 'string') {
          cleanedData.symptome_fievre = data.symptomes.includes('Fièvre')
          cleanedData.symptome_toux = data.symptomes.includes('Toux')
          cleanedData.symptome_douleurs = data.symptomes.includes('Douleurs musculaires')
          cleanedData.symptome_maux_tete = data.symptomes.includes('Maux de tête')
          cleanedData.symptome_diarrhee = data.symptomes.includes('Diarrhée')
          cleanedData.symptome_vomissements = data.symptomes.includes('Vomissements')
          cleanedData.symptome_fatigue = data.symptomes.includes('Fatigue')
          cleanedData.symptome_allergies = data.symptomes.includes('Allergies')
          cleanedData.symptome_malaise = data.symptomes.includes('Malaise')
          cleanedData.symptome_rhume = data.symptomes.includes('Rhume')
        }
        
        // Parser les examens depuis la string
        if (data.examens_demandes && typeof data.examens_demandes === 'string') {
          cleanedData.examen_sang = data.examens_demandes.includes('Analyse sanguine')
          cleanedData.examen_ecg = data.examens_demandes.includes('ECG')
          cleanedData.examen_echo = data.examens_demandes.includes('Échographie')
          cleanedData.examen_scanner = data.examens_demandes.includes('Scanner')
          cleanedData.examen_irm = data.examens_demandes.includes('IRM')
        }
        
        setFormData(prev => ({
          ...prev,
          ...cleanedData
        }))
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Erreur lors du chargement:', error)
        }
      }
    }

    fetchExistingExamen()
  }, [visitId])

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

  const buildSymptomesList = () => {
    const symptomes = []
    if (formData.symptome_fievre) symptomes.push('Fièvre')
    if (formData.symptome_toux) symptomes.push('Toux')
    if (formData.symptome_douleurs) symptomes.push('Douleurs musculaires')
    if (formData.symptome_maux_tete) symptomes.push('Maux de tête')
    if (formData.symptome_diarrhee) symptomes.push('Diarrhée')
    if (formData.symptome_vomissements) symptomes.push('Vomissements')
    if (formData.symptome_fatigue) symptomes.push('Fatigue')
    if (formData.symptome_allergies) symptomes.push('Allergies')
    if (formData.symptome_malaise) symptomes.push('Malaise')
    if (formData.symptome_rhume) symptomes.push('Rhume')
    if (formData.symptome_autres) symptomes.push(formData.symptomes || 'Autre')
    return symptomes.join(', ')
  }

  const buildExamensList = () => {
    const examens = []
    if (formData.examen_sang) examens.push('Analyse sanguine')
    if (formData.examen_ecg) examens.push('ECG')
    if (formData.examen_echo) examens.push('Échographie')
    if (formData.examen_scanner) examens.push('Scanner')
    if (formData.examen_irm) examens.push('IRM')
    if (formData.examen_autres) examens.push(formData.examens_demandes || 'Autres')
    return examens.join(', ')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!visitId) {
      toast.error('ID de visite manquant')
      return
    }

    try {
      setLoading(true)
      const cleanedData = cleanFormData({
        ...formData,
        symptomes: buildSymptomesList(),
        examens_demandes: buildExamensList(),
        player_id: playerId
      })
      
      try {
        await examenMedicalService.getByVisitId(visitId)
        await examenMedicalService.update(visitId, cleanedData)
        toast.success('Examen médical mis à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          await examenMedicalService.create(visitId, cleanedData)
          toast.success('Examen médical enregistré avec succès !')
        } else {
          throw error
        }
      }
      
      handleModuleNavigation({ navigate, moduleSequence, currentModuleIndex, playerId })
    } catch (error) {
      console.error('Erreur:', error)
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
      const cleanedData = cleanFormData({
        ...formData,
        symptomes: buildSymptomesList(),
        examens_demandes: buildExamensList(),
        player_id: playerId,
        statut: 'brouillon'
      })
      
      try {
        await examenMedicalService.getByVisitId(visitId)
        await examenMedicalService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          await examenMedicalService.create(visitId, cleanedData)
          toast.success('Brouillon enregistré !')
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <ModuleProgressIndicator 
        moduleProgress={moduleProgress}
        moduleSequence={moduleSequence}
        currentModuleIndex={currentModuleIndex}
      />
      
      {/* Informations générales */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Informations de consultation</CardTitle>
              <CardDescription>Date et type de consultation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date_consultation">Date de consultation</Label>
              <Input
                id="date_consultation"
                type="date"
                value={formData.date_consultation}
                onChange={(e) => handleChange('date_consultation', e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type_consultation">Type de consultation</Label>
              <Select value={formData.type_consultation} onValueChange={(value) => handleChange('type_consultation', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="controle">🔍 Contrôle</SelectItem>
                  <SelectItem value="urgence">🚨 Urgence</SelectItem>
                  <SelectItem value="suivi">📋 Suivi</SelectItem>
                  <SelectItem value="autre">📌 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => handleChange('statut', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">📝 Brouillon</SelectItem>
                  <SelectItem value="valide">✅ Validé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motif">Motif de consultation</Label>
            <Textarea
              id="motif"
              placeholder="Raison principale de la consultation..."
              value={formData.motif}
              onChange={(e) => handleChange('motif', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Symptômes */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Symptômes observés</CardTitle>
              <CardDescription>Sélectionner tous les symptômes applicables</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { key: 'symptome_fievre', label: '🌡️ Fièvre' },
              { key: 'symptome_toux', label: '😷 Toux' },
              { key: 'symptome_douleurs', label: '💪 Douleurs musculaires' },
              { key: 'symptome_maux_tete', label: '🤕 Maux de tête' },
              { key: 'symptome_diarrhee', label: '🚽 Diarrhée' },
              { key: 'symptome_vomissements', label: '🤮 Vomissements' },
              { key: 'symptome_fatigue', label: '😴 Fatigue' },
              { key: 'symptome_allergies', label: '🤧 Allergies' },
              { key: 'symptome_malaise', label: '😵 Malaise' },
              { key: 'symptome_rhume', label: '🤧 Rhume' },
              { key: 'symptome_autres', label: '📌 Autre' }
            ].map(symptome => (
              <div key={symptome.key} className="flex items-center space-x-2">
                <Checkbox
                  id={symptome.key}
                  checked={formData[symptome.key]}
                  onCheckedChange={(checked) => handleChange(symptome.key, checked)}
                />
                <Label htmlFor={symptome.key} className="cursor-pointer">{symptome.label}</Label>
              </div>
            ))}
          </div>
          
          {formData.symptome_autres && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="symptomes">Préciser les autres symptômes</Label>
              <Textarea
                id="symptomes"
                placeholder="Décrire les autres symptômes..."
                value={formData.symptomes}
                onChange={(e) => handleChange('symptomes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paramètres vitaux */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Paramètres vitaux</CardTitle>
              <CardDescription>Mesures physiologiques</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <ModernFormField
              label="Température"
              icon={Thermometer}
              id="temperature_c"
              unit="°C"
              placeholder="37.0"
              value={formData.temperature_c}
              onChange={(e) => handleChange('temperature_c', e.target.value)}
              gradient="from-pink-500 to-rose-500"
              step="0.1"
            />
            
            <div className="space-y-2">
              <Label htmlFor="tension_arterielle">Tension artérielle</Label>
              <Input
                id="tension_arterielle"
                placeholder="120/80 mmHg"
                value={formData.tension_arterielle}
                onChange={(e) => handleChange('tension_arterielle', e.target.value)}
                className="h-11"
              />
            </div>
            
            <ModernFormField
              label="Fréquence cardiaque"
              icon={Activity}
              id="frequence_cardiaque_bpm"
              unit="bpm"
              placeholder="70"
              value={formData.frequence_cardiaque_bpm}
              onChange={(e) => handleChange('frequence_cardiaque_bpm', e.target.value)}
              gradient="from-rose-500 to-red-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic et Traitement */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Diagnostic et Traitement</CardTitle>
              <CardDescription>Conclusions médicales</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="diagnostic">Diagnostic</Label>
            <Textarea
              id="diagnostic"
              placeholder="Diagnostic médical..."
              value={formData.diagnostic}
              onChange={(e) => handleChange('diagnostic', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="traitement">Traitement prescrit</Label>
            <Textarea
              id="traitement"
              placeholder="Médicaments et soins prescrits..."
              value={formData.traitement}
              onChange={(e) => handleChange('traitement', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recommandations">Recommandations</Label>
            <Textarea
              id="recommandations"
              placeholder="Conseils médicaux, repos, etc..."
              value={formData.recommandations}
              onChange={(e) => handleChange('recommandations', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Examens demandés */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Examens demandés</CardTitle>
              <CardDescription>Examens complémentaires prescrits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { key: 'examen_sang', label: '💉 Analyse sanguine' },
              { key: 'examen_ecg', label: '❤️ ECG' },
              { key: 'examen_echo', label: '📡 Échographie' },
              { key: 'examen_scanner', label: '🏥 Scanner' },
              { key: 'examen_irm', label: '🧲 IRM' },
              { key: 'examen_autres', label: '📌 Autres' }
            ].map(examen => (
              <div key={examen.key} className="flex items-center space-x-2">
                <Checkbox
                  id={examen.key}
                  checked={formData[examen.key]}
                  onCheckedChange={(checked) => handleChange(examen.key, checked)}
                />
                <Label htmlFor={examen.key} className="cursor-pointer">{examen.label}</Label>
              </div>
            ))}
          </div>
          
          {formData.examen_autres && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="examens_demandes">Préciser les autres examens</Label>
              <Textarea
                id="examens_demandes"
                placeholder="Décrire les autres examens demandés..."
                value={formData.examens_demandes}
                onChange={(e) => handleChange('examens_demandes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suivi */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-yellow-500" />
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Suivi</CardTitle>
              <CardDescription>Prochaine consultation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="date_suivi">Date de suivi prévue</Label>
            <Input
              id="date_suivi"
              type="date"
              value={formData.date_suivi}
              onChange={(e) => handleChange('date_suivi', e.target.value)}
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {visitId && (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Documents et pièces jointes</CardTitle>
                <CardDescription>Examens, ordonnances, résultats</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FileUpload 
              entityType="visit_examen_medical"
              entityId={visitId}
              onUploadSuccess={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              entityType="visit_examen_medical"
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
          className="gap-2 h-11 rounded-xl border-2 hover:bg-cyan-50 hover:border-cyan-500 hover:text-cyan-600 transition-all"
          onClick={handleSaveDraft}
          disabled={loading}
        >
          <Save className="h-4 w-4" />
          {loading ? 'Enregistrement...' : 'Enregistrer brouillon'}
        </Button>
        <Button 
          type="submit" 
          className="gap-2 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
          disabled={loading}
        >
          <span>{loading ? 'Validation...' : 'Valider la consultation'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}

