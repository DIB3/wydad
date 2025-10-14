import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Save, Trash2 } from 'lucide-react'
import playerService from '../services/player.service'
import notificationService from '../services/notification.service'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

export function CreatePlayerDialog({ onPlayerCreated }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    sex: '',
    birth_date: '',
    nationality: '',
    club: '',
    country: '',
    position: '',
    dominant_foot: '',
    height_cm: '',
    weight_kg: '',
    licence_id: '',
    allergies: '',
    notes: '',
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      sex: '',
      birth_date: '',
      nationality: '',
      club: '',
      country: '',
      position: '',
      dominant_foot: '',
      height_cm: '',
      weight_kg: '',
      licence_id: '',
      allergies: '',
      notes: '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Préparer les données (convertir les strings vides en null)
      const dataToSend = {
        ...formData,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      }

      // Supprimer les champs vides
      Object.keys(dataToSend).forEach((key) => {
        if (dataToSend[key] === '') {
          dataToSend[key] = null
        }
      })

      const newPlayer = await playerService.create(dataToSend)
      
      // Créer une notification pour le joueur créé
      if (user?.id) {
        try {
          await notificationService.create({
            user_id: user.id,
            type: 'success',
            priority: 'normal',
            title: '👤 Nouveau joueur ajouté',
            message: `${newPlayer.first_name} ${newPlayer.last_name} a été ajouté à l'effectif`,
            link: `/players/${newPlayer.id}`
          })
        } catch (notifError) {
          console.error('Erreur création notification:', notifError)
        }
      }
      
      toast.success('Joueur créé avec succès!', {
        description: `${newPlayer.first_name} ${newPlayer.last_name}`
      })
      
      if (onPlayerCreated) {
        onPlayerCreated(newPlayer)
      }
      
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error('Erreur création joueur:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la création du joueur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau joueur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[1400px] w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold">Créer un nouveau joueur</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                Remplissez les informations du joueur. Les champs marqués d'un * sont obligatoires.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <span className="text-xl">👤</span>
              Informations de base
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="Idriss"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="El Haddadi"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sex">Sexe</Label>
                <Select value={formData.sex} onValueChange={(value) => handleChange('sex', value)}>
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Homme</SelectItem>
                    <SelectItem value="F">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="licence_id">N° de licence</Label>
                <Input
                  id="licence_id"
                  value={formData.licence_id}
                  onChange={(e) => handleChange('licence_id', e.target.value)}
                  placeholder="FFF123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  placeholder="Française"
                />
              </div>
            </div>
          </div>

          {/* Club et sport */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <span className="text-xl">⚽</span>
              Club et position
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="club">Club</Label>
                <Input
                  id="club"
                  value={formData.club}
                  onChange={(e) => handleChange('club', e.target.value)}
                  placeholder="FC Exemple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="France"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Select value={formData.position} onValueChange={(value) => handleChange('position', value)}>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gardien">Gardien</SelectItem>
                    <SelectItem value="Défenseur">Défenseur</SelectItem>
                    <SelectItem value="Milieu">Milieu</SelectItem>
                    <SelectItem value="Ailier">Ailier</SelectItem>
                    <SelectItem value="Attaquant">Attaquant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dominant_foot">Pied dominant</Label>
                <Select value={formData.dominant_foot} onValueChange={(value) => handleChange('dominant_foot', value)}>
                  <SelectTrigger id="dominant_foot">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Droit">Droit</SelectItem>
                    <SelectItem value="Gauche">Gauche</SelectItem>
                    <SelectItem value="Ambidextre">Ambidextre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mesures physiques */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <span className="text-xl">📏</span>
              Mesures physiques
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height_cm">Taille (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  step="0.1"
                  value={formData.height_cm}
                  onChange={(e) => handleChange('height_cm', e.target.value)}
                  placeholder="180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Poids (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  step="0.1"
                  value={formData.weight_kg}
                  onChange={(e) => handleChange('weight_kg', e.target.value)}
                  placeholder="74"
                />
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <span className="text-xl">🏥</span>
              Informations médicales
            </h3>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                placeholder="Liste des allergies connues..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notes additionnelles..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-4 pt-8 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
              disabled={loading}
              className="gap-3 h-14 px-8 text-lg font-semibold"
            >
              <Trash2 className="h-5 w-5" />
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-3 h-14 px-8 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Création...' : 'Créer le joueur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

