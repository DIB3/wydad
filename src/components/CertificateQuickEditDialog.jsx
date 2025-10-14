import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import certificateService from '@/services/certificate.service'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function CertificateQuickEditDialog({ open, onOpenChange, playerId, currentCertificate, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    player_id: playerId,
    status: 'APTE',
    restrictions: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    physician_name: '',
  })

  useEffect(() => {
    if (currentCertificate) {
      setFormData({
        player_id: playerId,
        status: currentCertificate.status || currentCertificate.fitness_status || 'APTE',
        restrictions: currentCertificate.restrictions || '',
        valid_from: currentCertificate.valid_from || currentCertificate.issue_date || new Date().toISOString().split('T')[0],
        valid_until: currentCertificate.valid_until || currentCertificate.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        physician_name: currentCertificate.physician_name || '',
      })
    }
  }, [currentCertificate, playerId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Validation des champs requis
      if (!playerId) {
        toast.error('ID du joueur manquant')
        setLoading(false)
        return
      }
      
      if (!formData.status) {
        toast.error('Le statut d\'aptitude est requis')
        setLoading(false)
        return
      }
      
      if (!formData.valid_from) {
        toast.error('La date de début est requise')
        setLoading(false)
        return
      }
      
      if (!formData.physician_name || formData.physician_name.trim() === '') {
        toast.error('Le nom du médecin est requis')
        setLoading(false)
        return
      }
      
      if (!user.id) {
        toast.error('Utilisateur non connecté')
        setLoading(false)
        return
      }
      
      const certificateData = {
        player_id: playerId,
        status: formData.status,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        physician_name: formData.physician_name.trim(),
        restrictions: formData.restrictions || null,
        created_by: user.id
      }

      console.log('📤 Envoi des données du certificat:', certificateData)
      await certificateService.create(certificateData)
      toast.success('État d\'aptitude mis à jour avec succès')
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la création du certificat:', error)
      console.error('Détails de l\'erreur:', error.response?.data)
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour de l\'état d\'aptitude'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>🏥 Modifier l'État d'Aptitude</DialogTitle>
          <DialogDescription>
            Mettre à jour le certificat médical du joueur
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Statut d'Aptitude *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APTE">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>APTE - Apte à la pratique sportive</span>
                  </div>
                </SelectItem>
                <SelectItem value="APTE_RESTRICTIONS">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>APTE AVEC RESTRICTIONS</span>
                  </div>
                </SelectItem>
                <SelectItem value="TEMP_INAPTE">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>TEMPORAIREMENT INAPTE</span>
                  </div>
                </SelectItem>
                <SelectItem value="INAPTE">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>INAPTE - Inapte à la pratique sportive</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Date de début *</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_until">Date de fin</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="physician_name">Nom du médecin *</Label>
            <Input
              id="physician_name"
              placeholder="Dr. Ahmed Benali"
              value={formData.physician_name}
              onChange={(e) => setFormData({ ...formData, physician_name: e.target.value })}
              required
            />
          </div>

          {(formData.status === 'APTE_RESTRICTIONS' || formData.status === 'TEMP_INAPTE' || formData.status === 'INAPTE') && (
            <div className="space-y-2">
              <Label htmlFor="restrictions">Restrictions / Observations</Label>
              <Textarea
                id="restrictions"
                placeholder="Décrire les restrictions ou observations..."
                value={formData.restrictions}
                onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

