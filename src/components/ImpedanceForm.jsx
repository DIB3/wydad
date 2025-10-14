import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ModernFormField } from '@/components/ModernFormField'
import { Save, TrendingUp, Scale, Activity, Zap, Droplet, Ruler, Weight, ArrowRight, Move, Paperclip } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import impedanceService from '../services/impedance.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { useFormPersistence } from '../hooks/useFormPersistence'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'

const imcHistoryData = [
  { date: 'Jan', value: 22.5 },
  { date: 'Fév', value: 22.7 },
  { date: 'Mar', value: 22.6 },
  { date: 'Avr', value: 22.8 },
]

const bodyCompositionData = [
  { name: 'Masse grasse', value: 12, fill: 'url(#massGrasseGradient)' },
  { name: 'Masse maigre', value: 88, fill: 'url(#massMaigreGradient)' },
]

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
          console.log('🔍 Chargement des données Impédance existantes pour visitId:', visitId)
          const impedanceData = await impedanceService.getByVisitId(visitId)
          
          if (impedanceData && Object.keys(impedanceData).length > 0) {
            console.log('✅ Données Impédance trouvées:', impedanceData)
            setFormData({
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
            })
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

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Évolution IMC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={imcHistoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[22, 23.5]} className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Composition corporelle</CardTitle>
                <CardDescription>Répartition masse grasse et masse maigre</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bodyCompositionData}>
                <defs>
                  <linearGradient id="massGrasseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="massMaigreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#d946ef" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs font-medium" 
                  stroke="#64748b"
                  tick={{ fill: '#475569' }}
                />
                <YAxis 
                  className="text-xs" 
                  stroke="#64748b"
                  tick={{ fill: '#475569' }}
                  label={{ value: 'Pourcentage (%)', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    borderRadius: '12px',
                    border: '2px solid #ec4899',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                  formatter={(value, name) => [`${value}%`, name]}
                  cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }}
                />
                <Bar 
                  dataKey="value"
                  radius={[12, 12, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {bodyCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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

