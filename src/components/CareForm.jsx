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
  Save, ArrowRight, Zap, Wind, HandMetal, Waves, 
  Snowflake, Sparkles, Activity, Dumbbell, Flame,
  ThermometerSnowflake, Stethoscope, Heart, Paperclip
} from 'lucide-react'
import careService from '../services/care.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'
import { useFormPersistence } from '../hooks/useFormPersistence'

export function CareForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  
  // Obtenir les infos de progression multi-modules
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })

  const [formData, setFormData] = useState({
    care_date: new Date().toISOString().split('T')[0],
    duration_min: '',
    
    // Tecar
    tecar_used: false,
    tecar_duration_min: '',
    tecar_power_level: '',
    tecar_body_area: '',
    tecar_notes: '',
    
    // Ultrason
    ultrason_used: false,
    ultrason_duration_min: '',
    ultrason_frequency_mhz: '',
    ultrason_body_area: '',
    ultrason_notes: '',
    
    // Massage
    massage_used: false,
    massage_type: '',
    massage_duration_min: '',
    massage_body_area: '',
    massage_notes: '',
    
    // Normatec
    normatec_used: false,
    normatec_duration_min: '',
    normatec_pressure_level: '',
    normatec_notes: '',
    
    // Cryothérapie
    cryo_used: false,
    cryo_type: '',
    cryo_duration_min: '',
    cryo_temperature_c: '',
    cryo_body_area: '',
    cryo_notes: '',
    
    // BTL CRYO PUSH
    btl_cryo_used: false,
    btl_cryo_duration_min: '',
    btl_cryo_body_area: '',
    btl_cryo_notes: '',
    
    // Compex
    compex_used: false,
    compex_program: '',
    compex_duration_min: '',
    compex_body_area: '',
    compex_notes: '',
    
    // Ondes de choc
    shockwave_used: false,
    shockwave_duration_min: '',
    shockwave_intensity: '',
    shockwave_body_area: '',
    shockwave_notes: '',
    
    // Renforcement
    gym_used: false,
    gym_duration_min: '',
    gym_exercises: '',
    gym_load_description: '',
    gym_notes: '',
    
    // Sauna
    sauna_used: false,
    sauna_duration_min: '',
    sauna_temperature_c: '',
    sauna_notes: '',
    
    // Général
    overall_condition: '',
    pain_level_before: '',
    pain_level_after: '',
    therapist_name: '',
    general_notes: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('care', formData, setFormData, visitId)

  // Charger les données existantes au montage
  useEffect(() => {
    const fetchExistingCare = async () => {
      if (!visitId) return
      
      try {
        const data = await careService.getByVisitId(visitId)
        
        // Convertir tous les null en chaînes vides pour les inputs React
        const cleanedData = {}
        Object.keys(data).forEach(key => {
          cleanedData[key] = data[key] === null ? '' : data[key]
        })
        
        // Remplir le formulaire avec les données nettoyées
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

    fetchExistingCare()
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
        await careService.getByVisitId(visitId)
        await careService.update(visitId, cleanedData)
        toast.success('Soins mis à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          await careService.create(visitId, cleanedData)
          toast.success('Soins enregistrés avec succès !')
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
        await careService.getByVisitId(visitId)
        await careService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          await careService.create(visitId, cleanedData)
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
    <form className="space-y-6">
      {/* Indicateur de progression multi-modules */}
      <ModuleProgressIndicator 
        moduleProgress={moduleProgress}
        moduleSequence={moduleSequence}
        currentModuleIndex={currentModuleIndex}
      />
      
      {/* Date et Informations Générales */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Informations de la séance</CardTitle>
              <CardDescription>Date et données générales</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="care_date">Date du soin <span className="text-red-500">*</span></Label>
              <Input
                id="care_date"
                type="date"
                value={formData.care_date}
                onChange={(e) => handleChange('care_date', e.target.value)}
                className="h-11"
                required
              />
            </div>
            
            <ModernFormField
              label="Durée totale"
              icon={Activity}
              id="duration_min"
              unit="min"
              placeholder="60"
              value={formData.duration_min}
              onChange={(e) => handleChange('duration_min', e.target.value)}
              gradient="from-cyan-500 to-blue-500"
            />
            
            <div className="space-y-2">
              <Label htmlFor="therapist_name">Thérapeute</Label>
              <Input
                id="therapist_name"
                placeholder="Nom du kiné/thérapeute"
                value={formData.therapist_name}
                onChange={(e) => handleChange('therapist_name', e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="overall_condition">État général</Label>
              <Select value={formData.overall_condition} onValueChange={(value) => handleChange('overall_condition', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">😊 Excellent</SelectItem>
                  <SelectItem value="bon">🙂 Bon</SelectItem>
                  <SelectItem value="moyen">😐 Moyen</SelectItem>
                  <SelectItem value="fatigue">😓 Fatigué</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ModernFormField
              label="Douleur avant"
              icon={Heart}
              id="pain_level_before"
              unit="/10"
              placeholder="0-10"
              value={formData.pain_level_before}
              onChange={(e) => handleChange('pain_level_before', e.target.value)}
              gradient="from-red-500 to-orange-500"
              min={0}
              max={10}
            />

            <ModernFormField
              label="Douleur après"
              icon={Heart}
              id="pain_level_after"
              unit="/10"
              placeholder="0-10"
              value={formData.pain_level_after}
              onChange={(e) => handleChange('pain_level_after', e.target.value)}
              gradient="from-green-500 to-emerald-500"
              min={0}
              max={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* 1. Tecar Thérapie */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  1. Tecar Thérapie
                </CardTitle>
                <CardDescription>Radiofréquence et électrothérapie</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tecar_used"
                checked={formData.tecar_used}
                onCheckedChange={(checked) => handleChange('tecar_used', checked)}
              />
              <Label htmlFor="tecar_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.tecar_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="tecar_duration_min"
                unit="min"
                placeholder="20"
                value={formData.tecar_duration_min}
                onChange={(e) => handleChange('tecar_duration_min', e.target.value)}
                gradient="from-amber-500 to-orange-500"
              />
              
              <ModernFormField
                label="Niveau de puissance"
                icon={Zap}
                id="tecar_power_level"
                unit="/10"
                placeholder="1-10"
                value={formData.tecar_power_level}
                onChange={(e) => handleChange('tecar_power_level', e.target.value)}
                gradient="from-orange-500 to-red-500"
                min={1}
                max={10}
              />
              
              <div className="space-y-2">
                <Label htmlFor="tecar_body_area">Zone traitée</Label>
                <Input
                  id="tecar_body_area"
                  placeholder="Cuisse, mollet..."
                  value={formData.tecar_body_area}
                  onChange={(e) => handleChange('tecar_body_area', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tecar_notes">Notes</Label>
              <Textarea
                id="tecar_notes"
                placeholder="Observations sur la séance..."
                value={formData.tecar_notes}
                onChange={(e) => handleChange('tecar_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 2. Ultrason */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <Wind className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>2. Ultrason</CardTitle>
                <CardDescription>Thérapie par ultrasons</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ultrason_used"
                checked={formData.ultrason_used}
                onCheckedChange={(checked) => handleChange('ultrason_used', checked)}
              />
              <Label htmlFor="ultrason_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.ultrason_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="ultrason_duration_min"
                unit="min"
                placeholder="15"
                value={formData.ultrason_duration_min}
                onChange={(e) => handleChange('ultrason_duration_min', e.target.value)}
                gradient="from-blue-500 to-indigo-500"
              />
              
              <ModernFormField
                label="Fréquence"
                icon={Waves}
                id="ultrason_frequency_mhz"
                unit="MHz"
                placeholder="1.0"
                value={formData.ultrason_frequency_mhz}
                onChange={(e) => handleChange('ultrason_frequency_mhz', e.target.value)}
                gradient="from-indigo-500 to-purple-500"
                step="0.1"
              />
              
              <div className="space-y-2">
                <Label htmlFor="ultrason_body_area">Zone traitée</Label>
                <Input
                  id="ultrason_body_area"
                  placeholder="Tendon d'Achille..."
                  value={formData.ultrason_body_area}
                  onChange={(e) => handleChange('ultrason_body_area', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ultrason_notes">Notes</Label>
              <Textarea
                id="ultrason_notes"
                placeholder="Observations..."
                value={formData.ultrason_notes}
                onChange={(e) => handleChange('ultrason_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 3. Massages */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <HandMetal className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>3. Massages</CardTitle>
                <CardDescription>Manuels et pistolets de massage</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="massage_used"
                checked={formData.massage_used}
                onCheckedChange={(checked) => handleChange('massage_used', checked)}
              />
              <Label htmlFor="massage_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.massage_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="massage_type">Type de massage</Label>
                <Select value={formData.massage_type} onValueChange={(value) => handleChange('massage_type', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manuel">👐 Manuel</SelectItem>
                    <SelectItem value="pistolet">🔫 Pistolet</SelectItem>
                    <SelectItem value="les_deux">🤝 Les deux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="massage_duration_min"
                unit="min"
                placeholder="30"
                value={formData.massage_duration_min}
                onChange={(e) => handleChange('massage_duration_min', e.target.value)}
                gradient="from-purple-500 to-pink-500"
              />
              
              <div className="space-y-2">
                <Label htmlFor="massage_body_area">Zone massée</Label>
                <Input
                  id="massage_body_area"
                  placeholder="Jambes, dos..."
                  value={formData.massage_body_area}
                  onChange={(e) => handleChange('massage_body_area', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="massage_notes">Notes</Label>
              <Textarea
                id="massage_notes"
                placeholder="Observations..."
                value={formData.massage_notes}
                onChange={(e) => handleChange('massage_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 4. Normatec */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500" />
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>4. Normatec</CardTitle>
                <CardDescription>Compression pneumatique</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="normatec_used"
                checked={formData.normatec_used}
                onCheckedChange={(checked) => handleChange('normatec_used', checked)}
              />
              <Label htmlFor="normatec_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.normatec_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="normatec_duration_min"
                unit="min"
                placeholder="20"
                value={formData.normatec_duration_min}
                onChange={(e) => handleChange('normatec_duration_min', e.target.value)}
                gradient="from-teal-500 to-cyan-500"
              />
              
              <ModernFormField
                label="Niveau de pression"
                icon={Waves}
                id="normatec_pressure_level"
                unit="/10"
                placeholder="1-10"
                value={formData.normatec_pressure_level}
                onChange={(e) => handleChange('normatec_pressure_level', e.target.value)}
                gradient="from-cyan-500 to-blue-500"
                min={1}
                max={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="normatec_notes">Notes</Label>
              <Textarea
                id="normatec_notes"
                placeholder="Observations..."
                value={formData.normatec_notes}
                onChange={(e) => handleChange('normatec_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 5. Cryothérapie */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <Snowflake className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>5. Cryothérapie</CardTitle>
                <CardDescription>Game Ready / Cabine / Bain de glace</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cryo_used"
                checked={formData.cryo_used}
                onCheckedChange={(checked) => handleChange('cryo_used', checked)}
              />
              <Label htmlFor="cryo_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.cryo_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cryo_type">Type</Label>
                <Select value={formData.cryo_type} onValueChange={(value) => handleChange('cryo_type', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game_ready">🎮 Game Ready</SelectItem>
                    <SelectItem value="cabine">🏠 Cabine cryothérapie</SelectItem>
                    <SelectItem value="bain_glace">🧊 Bain de glace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="cryo_duration_min"
                unit="min"
                placeholder="15"
                value={formData.cryo_duration_min}
                onChange={(e) => handleChange('cryo_duration_min', e.target.value)}
                gradient="from-cyan-500 to-blue-500"
              />
              
              <ModernFormField
                label="Température"
                icon={ThermometerSnowflake}
                id="cryo_temperature_c"
                unit="°C"
                placeholder="-110"
                value={formData.cryo_temperature_c}
                onChange={(e) => handleChange('cryo_temperature_c', e.target.value)}
                gradient="from-blue-600 to-indigo-600"
                step="0.1"
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cryo_body_area">Zone traitée</Label>
                <Input
                  id="cryo_body_area"
                  placeholder="Jambes, corps entier..."
                  value={formData.cryo_body_area}
                  onChange={(e) => handleChange('cryo_body_area', e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cryo_notes">Notes</Label>
                <Textarea
                  id="cryo_notes"
                  placeholder="Observations..."
                  value={formData.cryo_notes}
                  onChange={(e) => handleChange('cryo_notes', e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 6. BTL CRYO PUSH */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-cyan-500" />
        <CardHeader className="bg-gradient-to-r from-sky-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                <ThermometerSnowflake className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>6. BTL CRYO PUSH</CardTitle>
                <CardDescription>Cryothérapie localisée</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="btl_cryo_used"
                checked={formData.btl_cryo_used}
                onCheckedChange={(checked) => handleChange('btl_cryo_used', checked)}
              />
              <Label htmlFor="btl_cryo_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.btl_cryo_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="btl_cryo_duration_min"
                unit="min"
                placeholder="10"
                value={formData.btl_cryo_duration_min}
                onChange={(e) => handleChange('btl_cryo_duration_min', e.target.value)}
                gradient="from-sky-500 to-cyan-500"
              />
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="btl_cryo_body_area">Zone traitée</Label>
                <Input
                  id="btl_cryo_body_area"
                  placeholder="Genou, cheville..."
                  value={formData.btl_cryo_body_area}
                  onChange={(e) => handleChange('btl_cryo_body_area', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="btl_cryo_notes">Notes</Label>
              <Textarea
                id="btl_cryo_notes"
                placeholder="Observations..."
                value={formData.btl_cryo_notes}
                onChange={(e) => handleChange('btl_cryo_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 7. Compex Électrostimulation */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-500" />
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>7. Compex Électrostimulation</CardTitle>
                <CardDescription>Stimulation musculaire électrique</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="compex_used"
                checked={formData.compex_used}
                onCheckedChange={(checked) => handleChange('compex_used', checked)}
              />
              <Label htmlFor="compex_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.compex_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="compex_program">Programme</Label>
                <Input
                  id="compex_program"
                  placeholder="Récupération, Endurance..."
                  value={formData.compex_program}
                  onChange={(e) => handleChange('compex_program', e.target.value)}
                  className="h-11"
                />
              </div>
              
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="compex_duration_min"
                unit="min"
                placeholder="25"
                value={formData.compex_duration_min}
                onChange={(e) => handleChange('compex_duration_min', e.target.value)}
                gradient="from-yellow-500 to-amber-500"
              />
              
              <div className="space-y-2">
                <Label htmlFor="compex_body_area">Zone traitée</Label>
                <Input
                  id="compex_body_area"
                  placeholder="Quadriceps..."
                  value={formData.compex_body_area}
                  onChange={(e) => handleChange('compex_body_area', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="compex_notes">Notes</Label>
              <Textarea
                id="compex_notes"
                placeholder="Observations..."
                value={formData.compex_notes}
                onChange={(e) => handleChange('compex_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 8. Ondes de choc */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>8. Ondes de choc</CardTitle>
                <CardDescription>Thérapie par ondes acoustiques</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shockwave_used"
                checked={formData.shockwave_used}
                onCheckedChange={(checked) => handleChange('shockwave_used', checked)}
              />
              <Label htmlFor="shockwave_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.shockwave_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="shockwave_duration_min"
                unit="min"
                placeholder="15"
                value={formData.shockwave_duration_min}
                onChange={(e) => handleChange('shockwave_duration_min', e.target.value)}
                gradient="from-red-500 to-orange-500"
              />
              
              <ModernFormField
                label="Intensité"
                icon={Zap}
                id="shockwave_intensity"
                unit="/10"
                placeholder="1-10"
                value={formData.shockwave_intensity}
                onChange={(e) => handleChange('shockwave_intensity', e.target.value)}
                gradient="from-orange-500 to-amber-500"
                min={1}
                max={10}
              />
              
              <div className="space-y-2">
                <Label htmlFor="shockwave_body_area">Zone traitée</Label>
                <Input
                  id="shockwave_body_area"
                  placeholder="Tendon..."
                  value={formData.shockwave_body_area}
                  onChange={(e) => handleChange('shockwave_body_area', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shockwave_notes">Notes</Label>
              <Textarea
                id="shockwave_notes"
                placeholder="Observations..."
                value={formData.shockwave_notes}
                onChange={(e) => handleChange('shockwave_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 9. Salle de renforcement */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>9. Salle de renforcement</CardTitle>
                <CardDescription>Exercices et musculation</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gym_used"
                checked={formData.gym_used}
                onCheckedChange={(checked) => handleChange('gym_used', checked)}
              />
              <Label htmlFor="gym_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.gym_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="gym_duration_min"
                unit="min"
                placeholder="45"
                value={formData.gym_duration_min}
                onChange={(e) => handleChange('gym_duration_min', e.target.value)}
                gradient="from-green-500 to-emerald-500"
              />
              
              <div className="space-y-2">
                <Label htmlFor="gym_exercises">Exercices effectués</Label>
                <Input
                  id="gym_exercises"
                  placeholder="Squats, presse..."
                  value={formData.gym_exercises}
                  onChange={(e) => handleChange('gym_exercises', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gym_load_description">Description des charges</Label>
              <Textarea
                id="gym_load_description"
                placeholder="3x10 reps à 50kg..."
                value={formData.gym_load_description}
                onChange={(e) => handleChange('gym_load_description', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gym_notes">Notes</Label>
              <Textarea
                id="gym_notes"
                placeholder="Observations..."
                value={formData.gym_notes}
                onChange={(e) => handleChange('gym_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 10. Cabine de sauna */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>10. Cabine de sauna</CardTitle>
                <CardDescription>Thérapie thermique</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sauna_used"
                checked={formData.sauna_used}
                onCheckedChange={(checked) => handleChange('sauna_used', checked)}
              />
              <Label htmlFor="sauna_used" className="font-semibold">Utilisé</Label>
            </div>
          </div>
        </CardHeader>
        {formData.sauna_used && (
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ModernFormField
                label="Durée"
                icon={Activity}
                id="sauna_duration_min"
                unit="min"
                placeholder="20"
                value={formData.sauna_duration_min}
                onChange={(e) => handleChange('sauna_duration_min', e.target.value)}
                gradient="from-orange-500 to-red-500"
              />
              
              <ModernFormField
                label="Température"
                icon={Flame}
                id="sauna_temperature_c"
                unit="°C"
                placeholder="80"
                value={formData.sauna_temperature_c}
                onChange={(e) => handleChange('sauna_temperature_c', e.target.value)}
                gradient="from-red-500 to-rose-500"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sauna_notes">Notes</Label>
              <Textarea
                id="sauna_notes"
                placeholder="Observations..."
                value={formData.sauna_notes}
                onChange={(e) => handleChange('sauna_notes', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notes générales */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-slate-500 to-gray-500" />
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-500 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Notes générales</CardTitle>
              <CardDescription>Observations et commentaires</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="general_notes">Commentaires généraux de la séance</Label>
            <Textarea
              id="general_notes"
              placeholder="Résumé de la séance de soins..."
              value={formData.general_notes}
              onChange={(e) => handleChange('general_notes', e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents et pièces jointes */}
      {visitId && (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Documents et pièces jointes</CardTitle>
                <CardDescription>Protocoles de soins, rapports de suivi et documents de traitement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FileUpload 
              entityType="visit_care"
              entityId={visitId}
              onUploadSuccess={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              entityType="visit_care"
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
          className="gap-2 h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span>{loading ? 'Validation...' : 'Valider la séance'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}

