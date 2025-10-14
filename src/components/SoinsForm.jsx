import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModernFormField } from '@/components/ModernFormField'
import { 
  Save, ArrowRight, Bandage, MapPin, FileText, 
  Pill, TrendingUp, Calendar
} from 'lucide-react'
import soinsService from '../services/soins.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { handleModuleNavigation, getModuleProgress } from '../utils/moduleNavigation'
import { ModuleProgressIndicator } from './ModuleProgressIndicator'
import { useFormPersistence } from '../hooks/useFormPersistence'

export function SoinsForm({ visitId, playerId, moduleSequence, currentModuleIndex }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)
  
  const moduleProgress = getModuleProgress({ moduleSequence, currentModuleIndex })

  const [formData, setFormData] = useState({
    date_soin: new Date().toISOString().split('T')[0],
    type_soin: '',
    zone_concernee: '',
    description: '',
    produits_utilises: '',
    resultat: '',
    recommandations: '',
    lien_blessure_id: '',
    statut: 'brouillon'
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Activer la persistance du formulaire lors de la création de visite
  useFormPersistence('soins', formData, setFormData, visitId)

  // Charger les données existantes au montage
  useEffect(() => {
    const fetchExistingSoin = async () => {
      if (!visitId) return
      
      try {
        const data = await soinsService.getByVisitId(visitId)
        
        // Convertir tous les null en chaînes vides pour les inputs React
        const cleanedData = {}
        Object.keys(data).forEach(key => {
          cleanedData[key] = data[key] === null ? '' : data[key]
        })
        
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

    fetchExistingSoin()
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
      const cleanedData = cleanFormData({
        ...formData,
        player_id: playerId,
        statut: 'valide'
      })
      
      try {
        await soinsService.getByVisitId(visitId)
        await soinsService.update(visitId, cleanedData)
        toast.success('Soin mis à jour avec succès !')
      } catch (error) {
        if (error.response?.status === 404) {
          await soinsService.create(visitId, cleanedData)
          toast.success('Soin enregistré avec succès !')
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
        player_id: playerId,
        statut: 'brouillon'
      })
      
      try {
        await soinsService.getByVisitId(visitId)
        await soinsService.update(visitId, cleanedData)
        toast.success('Brouillon mis à jour !')
      } catch (error) {
        if (error.response?.status === 404) {
          await soinsService.create(visitId, cleanedData)
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
      
      {/* Informations du soin */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500" />
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
              <Bandage className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Informations du soin</CardTitle>
              <CardDescription>Date et type de traitement</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date_soin">Date du soin</Label>
              <Input
                id="date_soin"
                type="date"
                value={formData.date_soin}
                onChange={(e) => handleChange('date_soin', e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type_soin">Type de soin</Label>
              <Select value={formData.type_soin} onValueChange={(value) => handleChange('type_soin', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pansement">🩹 Pansement</SelectItem>
                  <SelectItem value="massage">💆 Massage</SelectItem>
                  <SelectItem value="reeducation">🏃 Rééducation</SelectItem>
                  <SelectItem value="injection">💉 Injection</SelectItem>
                  <SelectItem value="cryotherapie">❄️ Cryothérapie</SelectItem>
                  <SelectItem value="electrostimulation">⚡ Électrostimulation</SelectItem>
                  <SelectItem value="infiltration">💊 Infiltration</SelectItem>
                  <SelectItem value="autre">📌 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zone_concernee">Zone concernée</Label>
              <Select value={formData.zone_concernee} onValueChange={(value) => handleChange('zone_concernee', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tete">👤 Tête</SelectItem>
                  <SelectItem value="cou">🦒 Cou</SelectItem>
                  <SelectItem value="epaule">💪 Épaule</SelectItem>
                  <SelectItem value="bras">🦾 Bras</SelectItem>
                  <SelectItem value="avant_bras">🤜 Avant-bras</SelectItem>
                  <SelectItem value="cuisse">🦵 Cuisse</SelectItem>
                  <SelectItem value="genou">🦿 Genou</SelectItem>
                  <SelectItem value="cheville">👟 Cheville</SelectItem>
                  <SelectItem value="pied">🦶 Pied</SelectItem>
                  <SelectItem value="dos">🧍 Dos</SelectItem>
                  <SelectItem value="autre">📌 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description et Produits */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Détails du soin</CardTitle>
              <CardDescription>Description et produits utilisés</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description du soin</Label>
            <Textarea
              id="description"
              placeholder="Décrire en détail le soin effectué..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="produits_utilises">Produits utilisés</Label>
            <Textarea
              id="produits_utilises"
              placeholder="Médicaments, matériels, équipements..."
              value={formData.produits_utilises}
              onChange={(e) => handleChange('produits_utilises', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Résultat et Recommandations */}
      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Résultat et Suivi</CardTitle>
              <CardDescription>Évaluation clinique</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="resultat">Résultat du soin</Label>
            <Select value={formData.resultat} onValueChange={(value) => handleChange('resultat', value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Évaluer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amelioration">✅ Amélioration</SelectItem>
                <SelectItem value="stable">➡️ Stable</SelectItem>
                <SelectItem value="deterioration">⚠️ Détérioration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recommandations">Recommandations</Label>
            <Textarea
              id="recommandations"
              placeholder="Suivi, repos, exercices recommandés..."
              value={formData.recommandations}
              onChange={(e) => handleChange('recommandations', e.target.value)}
              rows={3}
              className="resize-none"
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
                <CardDescription>Comptes rendus, photos, résultats</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FileUpload 
              entityType="visit_soins"
              entityId={visitId}
              onUploadSuccess={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              entityType="visit_soins"
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
          className="gap-2 h-11 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl rounded-xl text-white font-semibold group"
          disabled={loading}
        >
          <span>{loading ? 'Validation...' : 'Valider le soin'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  )
}

