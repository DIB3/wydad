import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ModernFormField } from '@/components/ModernFormField'
import { Save, TrendingUp, Scale, Activity, Zap, Droplet, Ruler, Weight, ArrowRight, Move, Paperclip, PieChart } from 'lucide-react'
import { 
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import impedanceService from '../services/impedance.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { useFormPersistence } from '../hooks/useFormPersistence'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'

export function ImpedanceForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  
  // Obtenir les infos de progression multi-modules
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })

  // Charger les données Impédance existantes
  useEffect(() => {
    const fetchExistingImpedance = async () => {
      if (visitId) {
        try {
          const impedanceData = await impedanceService.getByVisitId(visitId)
          
          if (impedanceData && Object.keys(impedanceData).length > 0) {
            setFormData(prevData => ({
              ...prevData,
              measurement_date: impedanceData.measurement_date || '',
              device: impedanceData.device || '',
              height_cm: impedanceData.height_cm || '',
              weight_kg: impedanceData.weight_kg || '',
              bmi: impedanceData.bmi || '',
              body_fat_percent: impedanceData.body_fat_percent || '',
              lean_mass_kg: impedanceData.lean_mass_kg || '',
              muscle_mass_kg: impedanceData.muscle_mass_kg || '',
              bone_mass_kg: impedanceData.bone_mass_kg || '',
              tbw_l: impedanceData.tbw_l || '',
              icw_l: impedanceData.icw_l || '',
              ecw_l: impedanceData.ecw_l || '',
              phase_angle_deg: impedanceData.phase_angle_deg || '',
              visceral_fat_index: impedanceData.visceral_fat_index || '',
              basal_metabolism_kcal: impedanceData.basal_metabolism_kcal || '',
              metabolic_age_years: impedanceData.metabolic_age_years || '',
              hydration_percent: impedanceData.hydration_percent || '',
              fat_mass_trunk_percent: impedanceData.fat_mass_trunk_percent || '',
              fat_mass_limbs_percent: impedanceData.fat_mass_limbs_percent || '',
              impedance_kohm: impedanceData.impedance_kohm || '',
              notes: impedanceData.notes || ''
            }))
            toast.success('Données Impédance chargées avec succès')
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error('❌ Erreur lors du chargement des données Impédance:', error)
            toast.error('Erreur lors du chargement des données')
          }
        }
      }
    }
    fetchExistingImpedance()
  }, [visitId])

  const [formData, setFormData] = useState({
    measurement_date: '',
    device: '',
    height_cm: '',
    weight_kg: '',
    bmi: '',
    body_fat_percent: '',
    lean_mass_kg: '',
    muscle_mass_kg: '',
    bone_mass_kg: '',
    tbw_l: '',
    icw_l: '',
    ecw_l: '',
    phase_angle_deg: '',
    visceral_fat_index: '',
    basal_metabolism_kcal: '',
    metabolic_age_years: '',
    hydration_percent: '',
    fat_mass_trunk_percent: '',
    fat_mass_limbs_percent: '',
    impedance_kohm: '',
    notes: ''
  })

  const calculateIMC = (h, w) => {
    const heightM = parseFloat(h) / 100
    const weightKg = parseFloat(w)
    if (heightM > 0 && weightKg > 0) {
      const calculatedIMC = weightKg / (heightM * heightM)
      return parseFloat(calculatedIMC.toFixed(1))
    }
    return null
  }

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      if (field === 'height_cm' || field === 'weight_kg') {
        const h = field === 'height_cm' ? value : prev.height_cm
        const w = field === 'weight_kg' ? value : prev.weight_kg
        updated.bmi = calculateIMC(h, w)
      }
      
      return updated
    })
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('impedance', formData, setFormData, visitId)

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
        await impedanceService.getByVisitId(visitId)
        await impedanceService.update(visitId, cleanedData)
        toast.success('Impédancemétrie mise à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          await impedanceService.create(visitId, cleanedData)
          toast.success('Impédancemétrie enregistrée avec succès !')
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
        await impedanceService.getByVisitId(visitId)
        await impedanceService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          await impedanceService.create(visitId, cleanedData)
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
  const getBodyCompositionData = () => {
    const data = []
    
    if (formData.body_fat_percent) {
      data.push({
        name: 'Masse grasse',
        value: parseFloat(formData.body_fat_percent),
        color: '#ef4444'
      })
    }
    
    if (formData.lean_mass_kg && formData.weight_kg) {
      const leanPercent = (parseFloat(formData.lean_mass_kg) / parseFloat(formData.weight_kg)) * 100
      data.push({
        name: 'Masse maigre',
        value: parseFloat(leanPercent.toFixed(1)),
        color: '#3b82f6'
      })
    }
    
    if (formData.muscle_mass_kg && formData.weight_kg) {
      const musclePercent = (parseFloat(formData.muscle_mass_kg) / parseFloat(formData.weight_kg)) * 100
      data.push({
        name: 'Masse musculaire',
        value: parseFloat(musclePercent.toFixed(1)),
        color: '#10b981'
      })
    }
    
    if (formData.bone_mass_kg && formData.weight_kg) {
      const bonePercent = (parseFloat(formData.bone_mass_kg) / parseFloat(formData.weight_kg)) * 100
      data.push({
        name: 'Masse osseuse',
        value: parseFloat(bonePercent.toFixed(1)),
        color: '#f59e0b'
      })
    }
    
    return data
  }

  const getWaterDistributionData = () => {
    const data = []
    
    if (formData.tbw_l) {
      data.push({
        compartiment: 'Eau totale',
        valeur: parseFloat(formData.tbw_l),
        reference: 'L'
      })
    }
    
    if (formData.icw_l) {
      data.push({
        compartiment: 'Eau intracellulaire',
        valeur: parseFloat(formData.icw_l),
        reference: 'L'
      })
    }
    
    if (formData.ecw_l) {
      data.push({
        compartiment: 'Eau extracellulaire',
        valeur: parseFloat(formData.ecw_l),
        reference: 'L'
      })
    }
    
    if (formData.hydration_percent) {
      data.push({
        compartiment: 'Hydratation',
        valeur: parseFloat(formData.hydration_percent),
        reference: '%'
      })
    }
    
    return data
  }

  const getMetabolismRadarData = () => {
    const data = []
    
    // IMC - Score basé sur les normes (18.5-24.9 optimal)
    if (formData.bmi) {
      const bmiValue = parseFloat(formData.bmi)
      const bmiScore = bmiValue >= 18.5 && bmiValue <= 24.9 ? 100 : 
                       Math.max(0, 100 - Math.abs(bmiValue - 21.7) * 10)
      data.push({ axe: 'IMC', value: Math.min(bmiScore, 100), fullMark: 100 })
    }
    
    // Masse grasse (optimal: 10-15% pour hommes sportifs)
    if (formData.body_fat_percent) {
      const fatValue = parseFloat(formData.body_fat_percent)
      const fatScore = fatValue >= 8 && fatValue <= 15 ? 100 : 
                       Math.max(0, 100 - Math.abs(fatValue - 12) * 5)
      data.push({ axe: 'Masse grasse', value: Math.min(fatScore, 100), fullMark: 100 })
    }
    
    // Angle de phase (optimal: >6°)
    if (formData.phase_angle_deg) {
      const phaseValue = parseFloat(formData.phase_angle_deg)
      const phaseScore = (phaseValue / 8) * 100
      data.push({ axe: 'Angle de phase', value: Math.min(phaseScore, 100), fullMark: 100 })
    }
    
    // Indice de graisse viscérale (optimal: <10)
    if (formData.visceral_fat_index) {
      const visceralValue = parseFloat(formData.visceral_fat_index)
      const visceralScore = Math.max(0, 100 - (visceralValue * 10))
      data.push({ axe: 'Graisse viscérale', value: Math.min(visceralScore, 100), fullMark: 100 })
    }
    
    // Métabolisme basal (score relatif au poids)
    if (formData.basal_metabolism_kcal && formData.weight_kg) {
      const metabolismRate = parseFloat(formData.basal_metabolism_kcal) / parseFloat(formData.weight_kg)
      const metabolismScore = (metabolismRate / 25) * 100
      data.push({ axe: 'Métabolisme', value: Math.min(metabolismScore, 100), fullMark: 100 })
    }
    
    return data
  }

  const getFatDistributionData = () => {
    const data = []
    
    if (formData.fat_mass_trunk_percent) {
      data.push({
        zone: 'Tronc',
        pourcentage: parseFloat(formData.fat_mass_trunk_percent)
      })
    }
    
    if (formData.fat_mass_limbs_percent) {
      data.push({
        zone: 'Membres',
        pourcentage: parseFloat(formData.fat_mass_limbs_percent)
      })
    }
    
    return data
  }

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  return (
    <form className="space-y-6">
      {/* Indicateur de progression multi-modules */}
      <ModuleProgressIndicator 
        moduleProgress={moduleProgress}
        moduleSequence={moduleSequence}
        currentModuleIndex={currentModuleIndex}
      />
      
      {/* Device & Basic Info */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>Appareil et mesures de référence</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 group">
              <Label htmlFor="device" className="text-sm font-semibold text-slate-700 group-focus-within:text-purple-600 transition-colors">
                Appareil utilisé <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="device" 
                placeholder="InBody 770" 
                value={formData.device}
                onChange={(e) => handleChange('device', e.target.value)}
                className="h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                required 
              />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="measure-date" className="text-sm font-semibold text-slate-700 group-focus-within:text-purple-600 transition-colors">
                Date de mesure <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="measure-date" 
                type="date" 
                value={formData.measurement_date}
                onChange={(e) => handleChange('measurement_date', e.target.value)}
                className="h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                required 
              />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <ModernFormField
              label="Taille"
              icon={Ruler}
              id="height_cm"
              unit="cm"
              placeholder="180"
              value={formData.height_cm}
              onChange={(e) => handleChange('height_cm', e.target.value)}
              gradient="from-purple-500 to-pink-500"
              required
            />
            <ModernFormField
              label="Poids"
              icon={Weight}
              id="weight_kg"
              unit="kg"
              placeholder="74"
              value={formData.weight_kg}
              onChange={(e) => handleChange('weight_kg', e.target.value)}
              gradient="from-pink-500 to-rose-500"
              required
              step="0.1"
            />
            <ModernFormField 
              label="IMC (calculé)" 
              icon={Activity}
              id="bmi" 
              unit="kg/m²" 
              value={formData.bmi || ''} 
              type="text"
              gradient="from-purple-500 to-fuchsia-500"
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Body Composition */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Composition corporelle</CardTitle>
              <CardDescription>Répartition des masses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
          <ModernFormField 
            label="Masse grasse" 
            icon={TrendingUp}
            id="body-fat" 
            unit="%" 
            placeholder="12" 
            gradient="from-pink-500 to-rose-500"
            value={formData.body_fat_percent}
            onChange={(e) => handleChange('body_fat_percent', e.target.value)}
            step="0.1" 
            required 
          />
          <ModernFormField 
            label="Masse maigre" 
            icon={Activity}
            id="lean-mass" 
            unit="kg" 
            placeholder="65.1" 
            gradient="from-purple-500 to-pink-500"
            value={formData.lean_mass_kg}
            onChange={(e) => handleChange('lean_mass_kg', e.target.value)}
            step="0.1" 
            required 
          />
          <ModernFormField
            label="Masse musculaire"
            icon={Zap}
            id="muscle-mass"
            unit="kg"
            placeholder="61.8"
            gradient="from-fuchsia-500 to-pink-500"
            value={formData.muscle_mass_kg}
            onChange={(e) => handleChange('muscle_mass_kg', e.target.value)}
            step="0.1"
            required
          />
          <ModernFormField 
            label="Masse osseuse" 
            icon={Activity}
            id="bone-mass" 
            unit="kg" 
            placeholder="3.3" 
            gradient="from-violet-500 to-purple-500"
            value={formData.bone_mass_kg}
            onChange={(e) => handleChange('bone_mass_kg', e.target.value)}
            step="0.1" 
            required 
          />
        </CardContent>
      </Card>

      {/* Eau corporelle */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Droplet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Eau corporelle</CardTitle>
              <CardDescription>Distribution hydrique et hydratation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 p-6">
          <ModernFormField 
            label="Eau totale" 
            icon={Droplet}
            id="tbw" 
            unit="L" 
            placeholder="45.2" 
            gradient="from-cyan-500 to-blue-500"
            value={formData.tbw_l}
            onChange={(e) => handleChange('tbw_l', e.target.value)}
            step="0.1" 
          />
          <ModernFormField 
            label="Eau intracellulaire" 
            icon={Droplet}
            id="icw" 
            unit="L" 
            placeholder="28.5" 
            gradient="from-blue-500 to-indigo-500"
            value={formData.icw_l}
            onChange={(e) => handleChange('icw_l', e.target.value)}
            step="0.1" 
          />
          <ModernFormField 
            label="Eau extracellulaire" 
            icon={Droplet}
            id="ecw" 
            unit="L" 
            placeholder="16.7" 
            gradient="from-indigo-500 to-purple-500"
            value={formData.ecw_l}
            onChange={(e) => handleChange('ecw_l', e.target.value)}
            step="0.1" 
          />
          <ModernFormField 
            label="Hydratation" 
            icon={Droplet}
            id="hydration" 
            unit="%" 
            placeholder="61.2" 
            gradient="from-purple-500 to-pink-500"
            value={formData.hydration_percent}
            onChange={(e) => handleChange('hydration_percent', e.target.value)}
            step="0.1" 
          />
        </CardContent>
      </Card>

      {/* Métabolisme et paramètres avancés */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Métabolisme et paramètres avancés</CardTitle>
              <CardDescription>Angle de phase, métabolisme et répartition graisseuse</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ModernFormField 
              label="Angle de phase" 
              icon={Zap}
              id="phase-angle" 
              unit="°" 
              placeholder="6.8" 
              gradient="from-orange-500 to-red-500"
              value={formData.phase_angle_deg}
              onChange={(e) => handleChange('phase_angle_deg', e.target.value)}
              step="0.1" 
            />
            <ModernFormField 
              label="Graisse viscérale" 
              icon={TrendingUp}
              id="visceral-fat" 
              unit="index" 
              placeholder="8" 
              gradient="from-red-500 to-pink-500"
              value={formData.visceral_fat_index}
              onChange={(e) => handleChange('visceral_fat_index', e.target.value)}
              step="0.1" 
            />
            <ModernFormField 
              label="Métabolisme basal" 
              icon={Activity}
              id="basal-metabolism" 
              unit="kcal" 
              placeholder="1850" 
              gradient="from-pink-500 to-purple-500"
              value={formData.basal_metabolism_kcal}
              onChange={(e) => handleChange('basal_metabolism_kcal', e.target.value)}
            />
            <ModernFormField 
              label="Âge métabolique" 
              icon={TrendingUp}
              id="metabolic-age" 
              unit="ans" 
              placeholder="24" 
              gradient="from-purple-500 to-indigo-500"
              value={formData.metabolic_age_years}
              onChange={(e) => handleChange('metabolic_age_years', e.target.value)}
            />
            <ModernFormField 
              label="Graisse tronc" 
              icon={Move}
              id="fat-trunk" 
              unit="%" 
              placeholder="8.5" 
              gradient="from-indigo-500 to-blue-500"
              value={formData.fat_mass_trunk_percent}
              onChange={(e) => handleChange('fat_mass_trunk_percent', e.target.value)}
              step="0.1" 
            />
            <ModernFormField 
              label="Graisse membres" 
              icon={Move}
              id="fat-limbs" 
              unit="%" 
              placeholder="6.2" 
              gradient="from-blue-500 to-cyan-500"
              value={formData.fat_mass_limbs_percent}
              onChange={(e) => handleChange('fat_mass_limbs_percent', e.target.value)}
              step="0.1" 
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ModernFormField 
              label="Impédance" 
              icon={Zap}
              id="impedance" 
              unit="kΩ" 
              placeholder="485" 
              gradient="from-cyan-500 to-teal-500"
              value={formData.impedance_kohm}
              onChange={(e) => handleChange('impedance_kohm', e.target.value)}
              step="0.1" 
            />
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                Notes et observations
              </Label>
              <Textarea
                id="notes"
                placeholder="Observations particulières sur les mesures..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="border-2 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl transition-all resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques dynamiques en temps réel */}
      {(getBodyCompositionData().length > 0 || getWaterDistributionData().length > 0 || getMetabolismRadarData().length > 0 || getFatDistributionData().length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 pt-4">
            <PieChart className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-800">Analyses en temps réel</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Composition corporelle (Pie Chart) */}
            {getBodyCompositionData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                      <PieChart className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Composition corporelle</CardTitle>
                      <CardDescription>Répartition des masses en temps réel</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={getBodyCompositionData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {getBodyCompositionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #ec4899',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Pourcentage']}
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

            {/* Distribution de l'eau (Bar Chart) */}
            {getWaterDistributionData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                      <Droplet className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Distribution hydrique</CardTitle>
                      <CardDescription>Compartiments hydriques corporels</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getWaterDistributionData()}>
                      <defs>
                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="compartiment" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #06b6d4',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [
                          `${value} ${props.payload.reference}`, 
                          props.payload.compartiment
                        ]}
                      />
                      <Bar 
                        dataKey="valeur" 
                        fill="url(#waterGradient)"
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

            {/* Profil métabolique (Radar) */}
            {getMetabolismRadarData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Profil métabolique</CardTitle>
                      <CardDescription>Score de santé métabolique global</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getMetabolismRadarData()}>
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
                        stroke="#f97316" 
                        fill="#f97316" 
                        fillOpacity={0.5}
                        strokeWidth={3}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #f97316',
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

            {/* Répartition graisseuse */}
            {getFatDistributionData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                      <Move className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Répartition graisseuse</CardTitle>
                      <CardDescription>Distribution de la masse grasse par zone</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getFatDistributionData()} layout="vertical">
                      <defs>
                        <linearGradient id="fatGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis 
                        dataKey="zone" 
                        type="category" 
                        width={80} 
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
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Graisse']}
                      />
                      <Bar 
                        dataKey="pourcentage" 
                        fill="url(#fatGradient)"
                        radius={[0, 8, 8, 0]}
                        name="Pourcentage de graisse"
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

      {/* Documents et pièces jointes */}
      {visitId && (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Documents et pièces jointes</CardTitle>
                <CardDescription>Rapports d'impédancemétrie, scans corporels et analyses de composition</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FileUpload 
              entityType="visit_impedance"
              entityId={visitId}
              onUploadSuccess={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              entityType="visit_impedance"
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
          className="gap-2 h-11 rounded-xl border-2 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-600 transition-all"
          onClick={handleSaveDraft}
          disabled={loading}
        >
          <Save className="h-4 w-4" />
          {loading ? 'Enregistrement...' : 'Enregistrer brouillon'}
        </Button>
        <Button 
          type="submit" 
          className="gap-2 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span>{loading ? 'Validation...' : 'Valider la mesure'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}

