import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModernFormField } from '@/components/ModernFormField'
import { FileUpload } from '@/components/FileUpload'
import { FileList } from '@/components/FileList'
import { PCMAReport } from '@/components/PCMAReport'
import { 
  Upload, Save, Heart, Ruler, Weight, Activity, 
  Stethoscope, Wind, Droplet, Brain, Thermometer, Zap, ArrowRight,
  FileText, TestTube, Pill, TrendingUp, Siren, Move, Paperclip, Printer, AlertCircle
} from 'lucide-react'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import pcmaService from '../services/pcma.service'
import playerService from '../services/player.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'
import { useFormPersistence } from '../hooks/useFormPersistence'
import { clearFormData } from '../utils/formPersistence'

export function PCMAForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [playerData, setPlayerData] = useState(null)
  
  // Obtenir les infos de progression multi-modules
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })
  
  // Charger les données du joueur
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (playerId) {
        try {
          const player = await playerService.getById(playerId)
          setPlayerData(player)
        } catch (error) {
          console.error('Erreur lors du chargement des données du joueur:', error)
        }
      }
    }
    fetchPlayerData()
  }, [playerId])

  // Charger les données PCMA existantes
  useEffect(() => {
    const fetchExistingPCMA = async () => {
      if (visitId) {
        try {
          const pcmaData = await pcmaService.getByVisitId(visitId)
          
          if (pcmaData && Object.keys(pcmaData).length > 0) {
            // Remplir le formulaire avec les données existantes
            setFormData(prevData => ({
              ...prevData,
              ...pcmaData,
              // S'assurer que les valeurs null sont converties en chaînes vides pour les inputs
              height_cm: pcmaData.height_cm || '',
              weight_kg: pcmaData.weight_kg || '',
              bmi: pcmaData.bmi || '',
              bp_sys: pcmaData.bp_sys || '',
              bp_dia: pcmaData.bp_dia || '',
              hr_bpm: pcmaData.hr_bpm || '',
              spo2: pcmaData.spo2 || '',
              temperature_c: pcmaData.temperature_c || '',
              ecg_date: pcmaData.ecg_date || '',
              ecg_conclusion: pcmaData.ecg_conclusion || '',
              fevg_percent: pcmaData.fevg_percent || '',
              vtd_vg_ml: pcmaData.vtd_vg_ml || '',
              vts_vg_ml: pcmaData.vts_vg_ml || '',
              lv_dd_mm: pcmaData.lv_dd_mm || '',
              lv_sd_mm: pcmaData.lv_sd_mm || '',
              lv_mass_g: pcmaData.lv_mass_g || '',
              lavi_ml_m2: pcmaData.lavi_ml_m2 || '',
              ravi_ml_m2: pcmaData.ravi_ml_m2 || '',
              tapse_mm: pcmaData.tapse_mm || '',
              s_prime_cms: pcmaData.s_prime_cms || '',
              paps_mmhg: pcmaData.paps_mmhg || '',
              aorta_sinus_mm: pcmaData.aorta_sinus_mm || '',
              aorta_asc_mm: pcmaData.aorta_asc_mm || '',
              valve_status: pcmaData.valve_status || '',
              pericardial_effusion: pcmaData.pericardial_effusion || '',
              echo_conclusion: pcmaData.echo_conclusion || '',
              vems: pcmaData.vems || '',
              cvf: pcmaData.cvf || '',
              ratio_vems_cvf: pcmaData.ratio_vems_cvf || '',
              resp_conclusion: pcmaData.resp_conclusion || '',
              hb_g_dl: pcmaData.hb_g_dl || '',
              ht_percent: pcmaData.ht_percent || '',
              wbc_g_l: pcmaData.wbc_g_l || '',
              platelets_g_l: pcmaData.platelets_g_l || '',
              ferritin_ng_ml: pcmaData.ferritin_ng_ml || '',
              crp_mg_l: pcmaData.crp_mg_l || '',
              glucose_mg_dl: pcmaData.glucose_mg_dl || '',
              hba1c_percent: pcmaData.hba1c_percent || '',
              tsh_mui_l: pcmaData.tsh_mui_l || '',
              ldl_mg_dl: pcmaData.ldl_mg_dl || '',
              hdl_mg_dl: pcmaData.hdl_mg_dl || '',
              tg_mg_dl: pcmaData.tg_mg_dl || '',
              creat_mg_dl: pcmaData.creat_mg_dl || '',
              egfr_ml_min: pcmaData.egfr_ml_min || '',
              spine: pcmaData.spine || '',
              shoulders: pcmaData.shoulders || '',
              hips: pcmaData.hips || '',
              knees: pcmaData.knees || '',
              ankles_feet: pcmaData.ankles_feet || '',
              proprioception: pcmaData.proprioception || '',
              functional_tests: pcmaData.functional_tests || '',
              msk_conclusion: pcmaData.msk_conclusion || '',
              aptitude: pcmaData.aptitude || '',
              restrictions: pcmaData.restrictions || '',
              recommendations: pcmaData.recommendations || '',
              physician_name: pcmaData.physician_name || '',
            }))
            toast.success('Données PCMA chargées avec succès')
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error('❌ Erreur lors du chargement des données PCMA:', error)
            toast.error('Erreur lors du chargement des données')
          }
        }
      }
    }
    fetchExistingPCMA()
  }, [visitId])
  
  // États du formulaire
  const [formData, setFormData] = useState({
    // Anthropométrie
    height_cm: '',
    weight_kg: '',
    bmi: '',
    
    // Signes vitaux
    bp_sys: '',
    bp_dia: '',
    hr_bpm: '',
    spo2: '',
    temperature_c: '',
    
    // ECG
    ecg_date: '',
    ecg_conclusion: '',
    
    // Échocardiographie
    fevg_percent: '',
    vtd_vg_ml: '',
    vts_vg_ml: '',
    lv_dd_mm: '',
    lv_sd_mm: '',
    lv_mass_g: '',
    lavi_ml_m2: '',
    ravi_ml_m2: '',
    tapse_mm: '',
    s_prime_cms: '',
    paps_mmhg: '',
    aorta_sinus_mm: '',
    aorta_asc_mm: '',
    valve_status: '',
    pericardial_effusion: '',
    echo_conclusion: '',
    
    // Fonction respiratoire
    vems: '',
    cvf: '',
    ratio_vems_cvf: '',
    resp_conclusion: '',
    
    // Biologie
    hb_g_dl: '',
    ht_percent: '',
    wbc_g_l: '',
    platelets_g_l: '',
    ferritin_ng_ml: '',
    crp_mg_l: '',
    glucose_mg_dl: '',
    hba1c_percent: '',
    tsh_mui_l: '',
    ldl_mg_dl: '',
    hdl_mg_dl: '',
    tg_mg_dl: '',
    creat_mg_dl: '',
    egfr_ml_min: '',
    
    // Examen musculo-squelettique
    spine: '',
    shoulders: '',
    hips: '',
    knees: '',
    ankles_feet: '',
    proprioception: '',
    functional_tests: '',
    msk_conclusion: '',
    
    // Décision médicale
    aptitude: '',
    restrictions: '',
    recommendations: '',
    physician_name: '',
  })

  // Calculate IMC automatically
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
      
      // Recalculer l'IMC si taille ou poids change
      if (field === 'height_cm' || field === 'weight_kg') {
        const h = field === 'height_cm' ? value : prev.height_cm
        const w = field === 'weight_kg' ? value : prev.weight_kg
        updated.bmi = calculateIMC(h, w)
      }
      
      return updated
    })
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('pcma', formData, setFormData, visitId)

  const cleanFormData = (data) => {
    const cleaned = {}
    Object.keys(data).forEach(key => {
      const value = data[key]
      // Convertir les chaînes vides en null pour les champs numériques
      if (value === '') {
        cleaned[key] = null
      } else if (value !== null && value !== undefined) {
        cleaned[key] = value
      }
    })
    return cleaned
  }

  const handleUploadSuccess = () => {
    setRefreshFiles(prev => prev + 1)
    toast.success('Fichier uploadé avec succès !')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!visitId) {
      toast.error('ID de visite manquant - Veuillez créer une visite d\'abord via /visits/new')
      return
    }

    try {
      setLoading(true)
      
      const cleanedData = cleanFormData(formData)
      
      // Vérifier si les données existent déjà
      try {
        await pcmaService.getByVisitId(visitId)
        await pcmaService.update(visitId, cleanedData)
        toast.success('Examen PCMA mis à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          await pcmaService.create(visitId, cleanedData)
          toast.success('Examen PCMA enregistré avec succès !')
        } else {
          throw error
        }
      }
      
      clearFormData()
      handleModuleNavigation({ navigate, moduleSequence, currentModuleIndex, playerId })
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement du PCMA')
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
        await pcmaService.getByVisitId(visitId)
        // Les données existent, on fait un update
        await pcmaService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          // Les données n'existent pas, on les crée
          await pcmaService.create(visitId, cleanedData)
          toast.success('Brouillon enregistré !')
        } else {
          throw error
        }
      }
      
      // Nettoyer le localStorage après sauvegarde réussie
      clearFormData()
    } catch (error) {
      console.error('Erreur:', error)
      console.error('Détails:', error.response?.data)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement du brouillon')
    } finally {
      setLoading(false)
    }
  }

  // Fonctions pour générer les données des graphiques dynamiquement
  const getCardioRadarData = () => {
    const data = []
    
    // FEVG (Fraction d'éjection ventriculaire gauche) - Normal: 55-70%
    if (formData.fevg_percent) {
      const fevgValue = (parseFloat(formData.fevg_percent) / 70) * 100
      data.push({ axe: 'FEVG', value: Math.min(fevgValue, 100), fullMark: 100 })
    }
    
    // Fréquence cardiaque au repos - Normal: 60-80 bpm (inversé car plus bas = mieux)
    if (formData.hr_bpm) {
      const hrValue = 100 - ((parseFloat(formData.hr_bpm) - 40) / 60) * 100
      data.push({ axe: 'FC repos', value: Math.max(Math.min(hrValue, 100), 0), fullMark: 100 })
    }
    
    // Tension artérielle - Normal: 120/80 (moyenne)
    if (formData.bp_sys && formData.bp_dia) {
      const bpMean = (parseFloat(formData.bp_sys) + parseFloat(formData.bp_dia)) / 2
      const bpValue = 100 - Math.abs(bpMean - 90) / 90 * 100
      data.push({ axe: 'TA', value: Math.max(Math.min(bpValue, 100), 0), fullMark: 100 })
    }
    
    // SpO₂ - Normal: 95-100%
    if (formData.spo2) {
      const spo2Value = parseFloat(formData.spo2)
      data.push({ axe: 'SpO₂', value: Math.min(spo2Value, 100), fullMark: 100 })
    }
    
    // Score global ECG (100 si conclusion présente)
    if (formData.ecg_conclusion && formData.ecg_conclusion.trim()) {
      data.push({ axe: 'ECG', value: 100, fullMark: 100 })
    }
    
    return data
  }

  const getBiologieData = () => {
    const data = []
    
    // Hémoglobine - Normal homme: 13-17 g/dL
    if (formData.hb_g_dl) {
      const hbValue = (parseFloat(formData.hb_g_dl) / 17) * 100
      data.push({ 
        categorie: 'Hémoglobine', 
        valeur: Math.min(hbValue, 100),
        reference: `${formData.hb_g_dl} g/dL`
      })
    }
    
    // Ferritine - Normal: 30-300 ng/mL
    if (formData.ferritin_ng_ml) {
      const ferValue = (parseFloat(formData.ferritin_ng_ml) / 300) * 100
      data.push({ 
        categorie: 'Ferritine', 
        valeur: Math.min(ferValue, 100),
        reference: `${formData.ferritin_ng_ml} ng/mL`
      })
    }
    
    // Lipides (HDL) - Normal: >40 mg/dL
    if (formData.hdl_mg_dl) {
      const hdlValue = (parseFloat(formData.hdl_mg_dl) / 60) * 100
      data.push({ 
        categorie: 'HDL', 
        valeur: Math.min(hdlValue, 100),
        reference: `${formData.hdl_mg_dl} mg/dL`
      })
    }
    
    // Glycémie - Normal: 70-100 mg/dL
    if (formData.glucose_mg_dl) {
      const glucoseVal = parseFloat(formData.glucose_mg_dl)
      const glucoseValue = 100 - Math.abs(glucoseVal - 85) / 85 * 100
      data.push({ 
        categorie: 'Glycémie', 
        valeur: Math.max(Math.min(glucoseValue, 100), 0),
        reference: `${formData.glucose_mg_dl} mg/dL`
      })
    }
    
    // Fonction rénale (eGFR) - Normal: >90 mL/min
    if (formData.egfr_ml_min) {
      const egfrValue = (parseFloat(formData.egfr_ml_min) / 90) * 100
      data.push({ 
        categorie: 'Fonction rénale', 
        valeur: Math.min(egfrValue, 100),
        reference: `${formData.egfr_ml_min} mL/min`
      })
    }
    
    return data
  }

  const getSignesVitauxData = () => {
    const data = []
    
    if (formData.bp_sys) {
      data.push({ 
        parametre: 'TA Systolique', 
        valeur: parseFloat(formData.bp_sys),
        min: 90,
        max: 140,
        optimal: 120
      })
    }
    
    if (formData.bp_dia) {
      data.push({ 
        parametre: 'TA Diastolique', 
        valeur: parseFloat(formData.bp_dia),
        min: 60,
        max: 90,
        optimal: 80
      })
    }
    
    if (formData.hr_bpm) {
      data.push({ 
        parametre: 'FC', 
        valeur: parseFloat(formData.hr_bpm),
        min: 40,
        max: 100,
        optimal: 60
      })
    }
    
    if (formData.spo2) {
      data.push({ 
        parametre: 'SpO₂', 
        valeur: parseFloat(formData.spo2),
        min: 90,
        max: 100,
        optimal: 98
      })
    }
    
    if (formData.temperature_c) {
      data.push({ 
        parametre: 'Température', 
        valeur: parseFloat(formData.temperature_c),
        min: 36,
        max: 38,
        optimal: 37
      })
    }
    
    return data
  }

  return (
    <>
    <form className="space-y-6">
      {/* Indicateur de progression multi-modules */}
      <ModuleProgressIndicator 
        moduleProgress={moduleProgress}
        moduleSequence={moduleSequence}
        currentModuleIndex={currentModuleIndex}
      />
      
      {/* Anthropométrie */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
          <CardTitle>Anthropométrie</CardTitle>
              <CardDescription>Mesures physiques du joueur</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3 p-6">
          <ModernFormField
            label="Taille"
            icon={Ruler}
            id="height_cm"
            unit="cm"
            placeholder="180"
            value={formData.height_cm}
            onChange={(e) => handleChange('height_cm', e.target.value)}
            gradient="from-blue-500 to-purple-500"
            required
            min={140}
            max={220}
          />
          <ModernFormField
            label="Poids"
            icon={Weight}
            id="weight_kg"
            unit="kg"
            placeholder="74"
            value={formData.weight_kg}
            onChange={(e) => handleChange('weight_kg', e.target.value)}
            gradient="from-emerald-500 to-teal-500"
            required
            min={40}
            max={150}
            step="0.1"
          />
          <ModernFormField
            label="IMC (calculé)"
            icon={Activity}
            id="bmi"
            unit="kg/m²"
            value={formData.bmi || ''}
            type="text"
            gradient="from-purple-500 to-pink-500"
            className="bg-gradient-to-r from-slate-50 to-slate-100"
          />
        </CardContent>
      </Card>

      {/* Signes vitaux */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
          <CardTitle>Signes vitaux</CardTitle>
              <CardDescription>Constantes physiologiques</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 p-6">
          <ModernFormField
            label="TA Systolique"
            icon={Heart}
            id="ta-sys"
            unit="mmHg"
            placeholder="120"
            gradient="from-red-500 to-pink-500"
            value={formData.bp_sys}
            onChange={(e) => handleChange('bp_sys', e.target.value)}
            required
            min={70}
            max={220}
          />
          <ModernFormField
            label="TA Diastolique"
            icon={Heart}
            id="ta-dia"
            unit="mmHg"
            placeholder="80"
            gradient="from-red-500 to-pink-500"
            value={formData.bp_dia}
            onChange={(e) => handleChange('bp_dia', e.target.value)}
            required
            min={40}
            max={130}
          />
          <ModernFormField
            label="Fréquence cardiaque"
            icon={Activity}
            id="fc"
            unit="bpm"
            placeholder="70"
            gradient="from-orange-500 to-red-500"
            value={formData.hr_bpm}
            onChange={(e) => handleChange('hr_bpm', e.target.value)}
            required
            min={30}
            max={220}
          />
          <ModernFormField 
            label="SpO₂" 
            icon={Wind}
            id="spo2" 
            unit="%" 
            placeholder="98" 
            gradient="from-blue-500 to-cyan-500"
            value={formData.spo2}
            onChange={(e) => handleChange('spo2', e.target.value)}
            required 
            min={80} 
            max={100} 
          />
          <ModernFormField
            label="Température"
            icon={Thermometer}
            id="temp"
            unit="°C"
            placeholder="36.8"
            gradient="from-orange-500 to-yellow-500"
            value={formData.temperature_c}
            onChange={(e) => handleChange('temperature_c', e.target.value)}
            required
            min={34}
            max={42}
            step="0.1"
          />
        </CardContent>
      </Card>

      {/* ECG */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
          <CardTitle>Électrocardiogramme (ECG)</CardTitle>
              <CardDescription>Examen cardiaque électrique</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 group">
              <Label htmlFor="ecg-date" className="text-sm font-semibold text-slate-700 group-focus-within:text-purple-600 transition-colors">
                Date de l&apos;ECG
              </Label>
              <Input 
                id="ecg_date" 
                type="date" 
                value={formData.ecg_date}
                onChange={(e) => handleChange('ecg_date', e.target.value)}
                className="h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ecg-file" className="text-sm font-semibold text-slate-700">
                Fichier ECG
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="ecg-file" 
                  type="file" 
                  accept=".pdf,.jpg,.png" 
                  className="h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                />
                <Button type="button" variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2 hover:bg-purple-50 hover:border-purple-500">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ecg-conclusion" className="text-sm font-semibold text-slate-700">
              Conclusion ECG
            </Label>
            <Textarea 
              id="ecg_conclusion" 
              placeholder="ECG normal, rythme sinusal..." 
              value={formData.ecg_conclusion}
              onChange={(e) => handleChange('ecg_conclusion', e.target.value)}
              rows={3}
              className="border-2 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Échocardiographie */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Échocardiographie</CardTitle>
              <CardDescription>Imagerie cardiaque ultrasonore</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ModernFormField 
              label="FEVG" 
              icon={Heart}
              id="fevg" 
              unit="%" 
              placeholder="60" 
              gradient="from-rose-500 to-pink-500"
              value={formData.fevg_percent}
              onChange={(e) => handleChange('fevg_percent', e.target.value)}
              min={20} 
              max={100} 
            />
            <ModernFormField 
              label="VTD" 
              icon={Activity}
              id="vtd" 
              unit="mL" 
              placeholder="120"
              gradient="from-pink-500 to-rose-500"
              value={formData.vtd_vg_ml}
              onChange={(e) => handleChange('vtd_vg_ml', e.target.value)}
            />
            <ModernFormField 
              label="VTS" 
              icon={Activity}
              id="vts" 
              unit="mL" 
              placeholder="45"
              gradient="from-fuchsia-500 to-pink-500"
              value={formData.vts_vg_ml}
              onChange={(e) => handleChange('vts_vg_ml', e.target.value)}
            />
            <ModernFormField 
              label="LV DD" 
              icon={Ruler}
              id="lv-dd" 
              unit="mm" 
              placeholder="48"
              gradient="from-purple-500 to-pink-500"
              value={formData.lv_dd_mm}
              onChange={(e) => handleChange('lv_dd_mm', e.target.value)}
            />
            <ModernFormField 
              label="LV SD" 
              icon={Ruler}
              id="lv-sd" 
              unit="mm" 
              placeholder="32"
              gradient="from-violet-500 to-purple-500"
              value={formData.lv_sd_mm}
              onChange={(e) => handleChange('lv_sd_mm', e.target.value)}
            />
            <ModernFormField 
              label="LAVI" 
              icon={TrendingUp}
              id="lavi" 
              unit="mL/m²" 
              placeholder="28"
              gradient="from-indigo-500 to-purple-500"
              value={formData.lavi_ml_m2}
              onChange={(e) => handleChange('lavi_ml_m2', e.target.value)}
            />
            <ModernFormField 
              label="RAVI" 
              icon={TrendingUp}
              id="ravi" 
              unit="mL/m²" 
              placeholder="25"
              gradient="from-blue-500 to-indigo-500"
              value={formData.ravi_ml_m2}
              onChange={(e) => handleChange('ravi_ml_m2', e.target.value)}
            />
            <ModernFormField 
              label="TAPSE" 
              icon={Move}
              id="tapse" 
              unit="mm" 
              placeholder="22"
              gradient="from-cyan-500 to-blue-500"
              value={formData.tapse_mm}
              onChange={(e) => handleChange('tapse_mm', e.target.value)}
            />
            <ModernFormField 
              label="S'" 
              icon={Zap}
              id="s-prime" 
              unit="cm/s" 
              placeholder="12"
              gradient="from-sky-500 to-cyan-500"
              value={formData.s_prime_cms}
              onChange={(e) => handleChange('s_prime_cms', e.target.value)}
            />
            <ModernFormField 
              label="PAPs" 
              icon={Siren}
              id="paps" 
              unit="mmHg" 
              placeholder="25"
              gradient="from-teal-500 to-cyan-500"
              value={formData.paps_mmhg}
              onChange={(e) => handleChange('paps_mmhg', e.target.value)}
            />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <ModernFormField 
              label="Sinus de l'aorte" 
              icon={Heart}
              id="aorta-sinus" 
              unit="mm" 
              placeholder="32"
              gradient="from-rose-500 to-pink-500"
              value={formData.aorta_sinus_mm}
              onChange={(e) => handleChange('aorta_sinus_mm', e.target.value)}
              step="0.1"
            />
            <ModernFormField 
              label="Aorte ascendante" 
              icon={Heart}
              id="aorta-asc" 
              unit="mm" 
              placeholder="35"
              gradient="from-pink-500 to-rose-500"
              value={formData.aorta_asc_mm}
              onChange={(e) => handleChange('aorta_asc_mm', e.target.value)}
              step="0.1"
            />
            <div className="space-y-2 group md:col-span-1">
              <Label htmlFor="valves" className="text-sm font-semibold text-slate-700 group-focus-within:text-pink-600 transition-colors">
                Statut des valves
              </Label>
              <Input 
                id="valve_status" 
                placeholder="Valves normales..."
                value={formData.valve_status}
                onChange={(e) => handleChange('valve_status', e.target.value)}
                className="h-12 border-2 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl transition-all"
              />
            </div>
          </div>
          <div className="space-y-2 group">
            <Label htmlFor="epanchement" className="text-sm font-semibold text-slate-700 group-focus-within:text-rose-600 transition-colors">
              Épanchement péricardique
            </Label>
            <Select value={formData.pericardial_effusion} onValueChange={(value) => handleChange('pericardial_effusion', value)}>
              <SelectTrigger id="epanchement" className="h-12 border-2 focus:border-rose-500 focus:ring-rose-500/20 rounded-xl">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">✅ Aucun</SelectItem>
                <SelectItem value="minimal">🔹 Minimal</SelectItem>
                <SelectItem value="moderate">⚠️ Modéré</SelectItem>
                <SelectItem value="severe">❌ Sévère</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="echo-conclusion" className="text-sm font-semibold text-slate-700">
              Conclusion échocardiographie
            </Label>
            <Textarea 
              id="echo_conclusion" 
              placeholder="Fonction systolique normale..." 
              value={formData.echo_conclusion}
              onChange={(e) => handleChange('echo_conclusion', e.target.value)}
              rows={3}
              className="border-2 focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fonction respiratoire */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Fonction respiratoire</CardTitle>
              <CardDescription>Capacité pulmonaire et spirométrie</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3 p-6">
          <ModernFormField 
            label="VEMS" 
            icon={Wind}
            id="vems" 
            unit="L" 
            placeholder="4.2" 
            gradient="from-cyan-500 to-blue-500"
            value={formData.vems}
            onChange={(e) => handleChange('vems', e.target.value)}
            step="0.1" 
          />
          <ModernFormField 
            label="CVF" 
            icon={Wind}
            id="cvf" 
            unit="L" 
            placeholder="5.1" 
            gradient="from-blue-500 to-indigo-500"
            value={formData.cvf}
            onChange={(e) => handleChange('cvf', e.target.value)}
            step="0.1" 
          />
          <ModernFormField 
            label="VEMS/CVF" 
            icon={TrendingUp}
            id="vems-cvf" 
            unit="%" 
            placeholder="82"
            gradient="from-indigo-500 to-purple-500"
            value={formData.ratio_vems_cvf}
            onChange={(e) => handleChange('ratio_vems_cvf', e.target.value)}
          />
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="resp-conclusion" className="text-sm font-semibold text-slate-700">
              Conclusion fonction respiratoire
            </Label>
            <Textarea 
              id="resp_conclusion" 
              placeholder="Fonction respiratoire normale..." 
              value={formData.resp_conclusion}
              onChange={(e) => handleChange('resp_conclusion', e.target.value)}
              rows={3}
              className="border-2 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Biologie */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Biologie</CardTitle>
              <CardDescription>Analyses sanguines et biologiques</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Droplet className="h-4 w-4 text-red-500" />
              Hématologie
            </h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <ModernFormField 
                label="Hémoglobine" 
                icon={Droplet}
                id="hb" 
                unit="g/dL" 
                placeholder="15.2" 
                gradient="from-red-500 to-rose-500"
                value={formData.hb_g_dl}
                onChange={(e) => handleChange('hb_g_dl', e.target.value)}
                step="0.1" 
              />
              <ModernFormField 
                label="Hématocrite" 
                icon={Droplet}
                id="ht" 
                unit="%" 
                placeholder="45" 
                gradient="from-rose-500 to-pink-500"
                value={formData.ht_percent}
                onChange={(e) => handleChange('ht_percent', e.target.value)}
                step="0.1" 
              />
              <ModernFormField 
                label="Globules blancs" 
                icon={Activity}
                id="gb" 
                unit="G/L" 
                placeholder="7.5" 
                gradient="from-amber-500 to-orange-500"
                value={formData.wbc_g_l}
                onChange={(e) => handleChange('wbc_g_l', e.target.value)}
                step="0.1" 
              />
              <ModernFormField 
                label="Plaquettes" 
                icon={Activity}
                id="plaq" 
                unit="G/L" 
                placeholder="250"
                gradient="from-orange-500 to-yellow-500"
                value={formData.platelets_g_l}
                onChange={(e) => handleChange('platelets_g_l', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Pill className="h-4 w-4 text-orange-500" />
              Fer et inflammation
            </h4>
            <div className="grid gap-6 md:grid-cols-2">
              <ModernFormField 
                label="Ferritine" 
                icon={Pill}
                id="ferritine" 
                unit="ng/mL" 
                placeholder="85"
                gradient="from-orange-500 to-amber-500"
                value={formData.ferritin_ng_ml}
                onChange={(e) => handleChange('ferritin_ng_ml', e.target.value)}
              />
              <ModernFormField 
                label="CRP" 
                icon={Siren}
                id="crp" 
                unit="mg/L" 
                placeholder="2" 
                gradient="from-red-500 to-orange-500"
                value={formData.crp_mg_l}
                onChange={(e) => handleChange('crp_mg_l', e.target.value)}
                step="0.1" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Métabolisme
            </h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ModernFormField 
                label="Glycémie" 
                icon={Activity}
                id="glycemie" 
                unit="mmol/L" 
                placeholder="5.2" 
                gradient="from-purple-500 to-indigo-500"
                value={formData.glucose_mg_dl}
                onChange={(e) => handleChange('glucose_mg_dl', e.target.value)}
                step="0.1" 
              />
              <ModernFormField 
                label="HbA1c" 
                icon={Droplet}
                id="hba1c" 
                unit="%" 
                placeholder="5.4" 
                gradient="from-indigo-500 to-blue-500"
                value={formData.hba1c_percent}
                onChange={(e) => handleChange('hba1c_percent', e.target.value)}
                step="0.1" 
              />
              <ModernFormField 
                label="TSH" 
                icon={Brain}
                id="tsh" 
                unit="mUI/L" 
                placeholder="2.1" 
                gradient="from-blue-500 to-cyan-500"
                value={formData.tsh_mui_l}
                onChange={(e) => handleChange('tsh_mui_l', e.target.value)}
                step="0.1" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Bilan lipidique
            </h4>
            <div className="grid gap-6 md:grid-cols-3">
              <ModernFormField 
                label="LDL" 
                icon={TrendingUp}
                id="ldl" 
                unit="g/L" 
                placeholder="1.2" 
                gradient="from-green-500 to-emerald-500"
                value={formData.ldl_mg_dl}
                onChange={(e) => handleChange('ldl_mg_dl', e.target.value)}
                step="0.01" 
              />
              <ModernFormField 
                label="HDL" 
                icon={TrendingUp}
                id="hdl" 
                unit="g/L" 
                placeholder="0.6" 
                gradient="from-emerald-500 to-teal-500"
                value={formData.hdl_mg_dl}
                onChange={(e) => handleChange('hdl_mg_dl', e.target.value)}
                step="0.01" 
              />
              <ModernFormField 
                label="Triglycérides" 
                icon={Droplet}
                id="tg" 
                unit="g/L" 
                placeholder="0.9" 
                gradient="from-teal-500 to-cyan-500"
                value={formData.tg_mg_dl}
                onChange={(e) => handleChange('tg_mg_dl', e.target.value)}
                step="0.01" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Fonction rénale
            </h4>
            <div className="grid gap-6 md:grid-cols-2">
              <ModernFormField 
                label="Créatinine" 
                icon={TestTube}
                id="creat" 
                unit="µmol/L" 
                placeholder="85"
                gradient="from-blue-500 to-indigo-500"
                value={formData.creat_mg_dl}
                onChange={(e) => handleChange('creat_mg_dl', e.target.value)}
              />
              <ModernFormField 
                label="DFG" 
                icon={Activity}
                id="dfg" 
                unit="mL/min" 
                placeholder="95"
                gradient="from-indigo-500 to-violet-500"
                value={formData.egfr_ml_min}
                onChange={(e) => handleChange('egfr_ml_min', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Musculo-squelettique */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-lime-500 to-green-500" />
        <CardHeader className="bg-gradient-to-r from-lime-50 to-green-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-lime-500 to-green-500 text-white">
              <Move className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Examen musculo-squelettique</CardTitle>
              <CardDescription>Mobilité et fonction musculaire</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="msk-observations" className="text-sm font-semibold text-slate-700">
              Observations
            </Label>
            <Textarea 
              id="msk_conclusion" 
              placeholder="Mobilité articulaire normale..." 
              value={formData.msk_conclusion}
              onChange={(e) => handleChange('msk_conclusion', e.target.value)}
              rows={4}
              className="border-2 focus:border-lime-500 focus:ring-lime-500/20 rounded-xl transition-all resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msk-tests" className="text-sm font-semibold text-slate-700">
              Tests spécifiques
            </Label>
            <Textarea 
              id="functional_tests" 
              placeholder="Tests de stabilité, force musculaire..." 
              value={formData.functional_tests}
              onChange={(e) => handleChange('functional_tests', e.target.value)}
              rows={3}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Graphiques dynamiques en temps réel */}
      {(getCardioRadarData().length > 0 || getBiologieData().length > 0 || getSignesVitauxData().length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 pt-4">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Analyses en temps réel</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profil cardiovasculaire (Radar) */}
            {getCardioRadarData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-pink-500" />
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Profil cardiovasculaire</CardTitle>
                      <CardDescription>Analyse dynamique des paramètres cardiaques</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getCardioRadarData()}>
                      <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
                      <PolarAngleAxis 
                        dataKey="axe" 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Radar 
                        name="Performance" 
                        dataKey="value" 
                        stroke="#f43f5e" 
                        fill="#f43f5e" 
                        fillOpacity={0.5}
                        strokeWidth={3}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #f43f5e',
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

            {/* Bilan biologique */}
            {getBiologieData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                      <TestTube className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Bilan biologique</CardTitle>
                      <CardDescription>Score de santé par catégorie</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getBiologieData()} layout="vertical">
                      <defs>
                        <linearGradient id="bioDynamicGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis 
                        dataKey="categorie" 
                        type="category" 
                        width={120} 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #f59e0b',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => [
                          `${value.toFixed(1)}% - ${props.payload.reference}`, 
                          'Score'
                        ]}
                      />
                      <Bar 
                        dataKey="valeur" 
                        fill="url(#bioDynamicGradient)"
                        radius={[0, 8, 8, 0]}
                        name="Score (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-center text-slate-600 mt-4">
                    ✨ Graphique mis à jour en temps réel avec vos données
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Signes vitaux */}
            {getSignesVitauxData().length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden md:col-span-2">
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Signes vitaux</CardTitle>
                      <CardDescription>Paramètres physiologiques en temps réel</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSignesVitauxData()}>
                      <defs>
                        <linearGradient id="vitalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="parametre" 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          borderRadius: '12px',
                          border: '2px solid #3b82f6',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '12px'
                        }}
                        formatter={(value, name, props) => {
                          const { optimal, min, max } = props.payload
                          return [
                            `Valeur: ${value} | Optimal: ${optimal} | Range: ${min}-${max}`, 
                            props.payload.parametre
                          ]
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="valeur" 
                        fill="url(#vitalGradient)"
                        radius={[8, 8, 0, 0]}
                        name="Valeur actuelle"
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

      {/* Aptitude */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Décision d&apos;aptitude</CardTitle>
              <CardDescription>Conclusion médicale finale</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2 group">
            <Label htmlFor="fitness-status" className="text-sm font-semibold text-slate-700 group-focus-within:text-green-600 transition-colors flex items-center gap-2">
              État d&apos;aptitude 
              <span className="text-red-500">*</span>
              {formData.aptitude && (
                <span className="text-xl">
                  {formData.aptitude === 'APTE' ? '✅' : 
                   formData.aptitude === 'APTE_RESTRICTIONS' ? '⚠️' : 
                   formData.aptitude === 'TEMP_INAPTE' ? '🔸' : '❌'}
                </span>
              )}
            </Label>
            <Select value={formData.aptitude} onValueChange={(value) => handleChange('aptitude', value)}>
              <SelectTrigger id="fitness-status" className="h-12 border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl">
                <SelectValue placeholder="Sélectionner l'état d'aptitude..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="APTE" className="cursor-pointer">✅ Apte</SelectItem>
                <SelectItem value="APTE_RESTRICTIONS" className="cursor-pointer">⚠️ Apte avec restrictions</SelectItem>
                <SelectItem value="TEMP_INAPTE" className="cursor-pointer">🔸 Temporairement inapte</SelectItem>
                <SelectItem value="INAPTE" className="cursor-pointer">❌ Inapte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.aptitude === 'APTE_RESTRICTIONS' || formData.aptitude === 'TEMP_INAPTE') && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="restrictions" className="text-sm font-semibold text-slate-700">
                Restrictions / Précisions
              </Label>
              <Textarea
                id="restrictions"
                placeholder="Détailler les restrictions ou la durée d'inaptitude..."
                value={formData.restrictions}
                onChange={(e) => handleChange('restrictions', e.target.value)}
                rows={3}
                className="border-2 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl transition-all resize-none"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="recommendations" className="text-sm font-semibold text-slate-700">
              Recommandations
            </Label>
            <Textarea 
              id="recommendations" 
              placeholder="Recommandations médicales..." 
              value={formData.recommendations}
              onChange={(e) => handleChange('recommendations', e.target.value)}
              rows={4}
              className="border-2 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-slate-500 to-gray-600" />
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Signature médicale</CardTitle>
              <CardDescription>Validation du médecin examinateur</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2 group">
            <Label htmlFor="doctor-name" className="text-sm font-semibold text-slate-700 group-focus-within:text-slate-600 transition-colors">
              Nom du médecin <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="physician_name" 
              placeholder="Dr. Martin Dubois" 
              value={formData.physician_name}
              onChange={(e) => handleChange('physician_name', e.target.value)}
              className="h-12 border-2 focus:border-slate-500 focus:ring-slate-500/20 rounded-xl transition-all"
              required 
            />
          </div>
          <div className="space-y-2 group">
            <Label htmlFor="signature-date" className="text-sm font-semibold text-slate-700 group-focus-within:text-slate-600 transition-colors">
              Date de signature <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="signature-date" 
              type="date" 
              className="h-12 border-2 focus:border-slate-500 focus:ring-slate-500/20 rounded-xl transition-all"
              required 
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents et pièces jointes */}
      {visitId ? (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#29BACD] via-[#1A8A9A] to-[#7BD5E1]" />
          <CardHeader className="bg-gradient-to-r from-[#29BACD]/5 to-[#7BD5E1]/5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#29BACD] to-[#1A8A9A] text-white">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Documents et pièces jointes</CardTitle>
                <CardDescription>Joindre les examens médicaux et résultats d&apos;analyses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="general" className="gap-2">
                  <Paperclip className="h-4 w-4" />
                  Général
                </TabsTrigger>
                <TabsTrigger value="cardio" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Cardio
                </TabsTrigger>
                <TabsTrigger value="biology" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Biologie
                </TabsTrigger>
                <TabsTrigger value="physical" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Physique
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Tous
                </TabsTrigger>
              </TabsList>

              {/* Onglet Général */}
              <TabsContent value="general" className="space-y-6">
                {/* Anthropométrie */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-[#29BACD]" />
                    Anthropométrie
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="anthropometry"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="anthropometry"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>

                {/* Signes vitaux */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-[#29BACD]" />
                    Signes vitaux
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="vital_signs"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="vital_signs"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Cardio */}
              <TabsContent value="cardio" className="space-y-6">
                {/* ECG */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#29BACD]" />
                    Électrocardiogramme (ECG)
                  </h3>
                  {visitId ? (
                    <>
                      <FileUpload
                        entityType="visit_pcma"
                        entityId={visitId}
                        category="ecg"
                        lockCategory={true}
                        onUploadSuccess={handleUploadSuccess}
                      />
                      <div className="mt-4">
                        <FileList
                          entityType="visit_pcma"
                          entityId={visitId}
                          category="ecg"
                          refreshTrigger={refreshFiles}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-amber-600">⚠️ Créez d&apos;abord une visite pour attacher des fichiers ECG</p>
                  )}
                </div>

                {/* Échocardiographie */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#29BACD]" />
                    Échocardiographie
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="echocardiography"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="echocardiography"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Biologie */}
              <TabsContent value="biology" className="space-y-6">
                {/* Analyses sanguines */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-[#29BACD]" />
                    Analyses sanguines
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="blood_test"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="blood_test"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>

                {/* Analyses urinaires */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-[#29BACD]" />
                    Analyses urinaires
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="urine_test"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="urine_test"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Physique */}
              <TabsContent value="physical" className="space-y-6">
                {/* Fonction respiratoire */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wind className="h-5 w-5 text-[#29BACD]" />
                    Fonction respiratoire
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="respiratory_function"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="respiratory_function"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>

                {/* Examen musculo-squelettique */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#29BACD]" />
                    Examen musculo-squelettique
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="musculoskeletal_exam"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="musculoskeletal_exam"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>

                {/* Imagerie médicale (IRM, Scanner, Radio) */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[#29BACD]" />
                    Imagerie médicale (IRM, Scanner, Radiologie)
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="radiology"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="radiology"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>

                {/* Décision d'aptitude */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#29BACD]" />
                    Décision d&apos;aptitude
                  </h3>
                  <FileUpload
                    entityType="visit_pcma"
                    entityId={visitId}
                    category="fitness_decision"
                    onUploadSuccess={handleUploadSuccess}
                  />
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      category="fitness_decision"
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Tous les documents */}
              <TabsContent value="all" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-[#29BACD]" />
                    Tous les documents du PCMA
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Vue d&apos;ensemble de tous les fichiers attachés à cet examen PCMA
                  </p>
                  <div className="mt-4">
                    <FileList
                      entityType="visit_pcma"
                      entityId={visitId}
                      refreshTrigger={refreshFiles}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-2 border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Visite non créée</p>
                <p className="text-sm text-amber-700 mt-1">
                  Vous devez d&apos;abord créer une visite pour pouvoir attacher des documents.
                </p>
              </div>
            </div>
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
          onClick={() => setShowReport(true)}
          disabled={!visitId}
        >
          <Printer className="h-4 w-4" />
          Rapport CAF
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="gap-2 h-11 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all"
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
          <span>{loading ? 'Validation...' : 'Valider la visite'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>

    {/* Modal du rapport PCMA */}
    {showReport && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-auto">
          <PCMAReport 
            visitId={visitId}
            playerId={playerId}
            playerData={playerData}
            onClose={() => setShowReport(false)}
          />
        </div>
      </div>
    )}
  </>
  )
}

