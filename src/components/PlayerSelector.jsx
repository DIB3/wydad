import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, TrendingUp, Activity, Plus, Loader2 } from 'lucide-react'
import { usePlayers } from '../hooks/usePlayers'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import visitService from '../services/visit.service'
import { toast } from 'sonner'

export function PlayerSelector({ selectedPlayerId, onPlayerSelect, lastVisits = [], showCreateButton = true, moduleName, moduleRoute }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [creating, setCreating] = useState(false)
  const { players, loading } = usePlayers()
  const [selectedPlayer, setSelectedPlayer] = useState(selectedPlayerId || '')

  useEffect(() => {
    if (selectedPlayerId) {
      setSelectedPlayer(selectedPlayerId)
    }
  }, [selectedPlayerId])

  const handlePlayerChange = (playerId) => {
    setSelectedPlayer(playerId)
    if (onPlayerSelect) {
      onPlayerSelect(playerId)
    }
  }

  const handleCreateVisit = async () => {
    if (!selectedPlayer || !moduleName || !user) {
      toast.error('Informations manquantes')
      return
    }

    setCreating(true)
    
    try {
      // Émettre un événement pour que le formulaire sauvegarde ses données
      const saveEvent = new CustomEvent('saveFormBeforeVisitCreation', {
        detail: { moduleName, moduleRoute }
      })
      window.dispatchEvent(saveEvent)
      
      // Petit délai pour permettre au formulaire de sauvegarder
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Mapper les noms de modules vers les valeurs de la base de données
      const moduleMapping = {
        'PCMA': 'pcma',
        'Impédancemétrie': 'impedance',
        'GPS': 'gps',
        'Blessures': 'injury',
        'Nutrition': 'nutrition',
        'Soins': 'care',
        'Examen médical': 'examen_medical',
        'Soins & Traitements': 'soins'
      }

      // Créer la visite directement
      const visitData = {
        player_id: selectedPlayer,
        visit_date: new Date().toISOString().split('T')[0],
        module: moduleMapping[moduleName] || moduleName.toLowerCase(),
        created_by: user.id
      }

      const createdVisit = await visitService.create(visitData)
      
      toast.success('Visite créée avec succès !')

      // Recharger la page avec le visitId
      navigate(moduleRoute || location.pathname, {
        state: {
          visitId: createdVisit.id,
          playerId: selectedPlayer
        },
        replace: true
      })
      
      // Recharger la page pour avoir les nouvelles props
      window.location.reload()
    } catch (error) {
      console.error('❌ Erreur création visite:', error)
      console.error('❌ Détails:', error.response?.data)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création de la visite'
      toast.error(errorMsg)
      setCreating(false)
    }
  }

  const currentPlayer = players.find(p => p.id === selectedPlayer)
  const playerVisits = lastVisits.filter(v => v.player_id === selectedPlayer)

  return (
    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Sélection du joueur</CardTitle>
              <CardDescription>Choisissez le joueur pour voir son historique</CardDescription>
            </div>
          </div>
          {showCreateButton && selectedPlayer && moduleName && (
            <Button 
              onClick={handleCreateVisit}
              disabled={creating}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Créer nouvelle visite
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Sélecteur de joueur */}
        <div className="space-y-2">
          <Select value={selectedPlayer} onValueChange={handlePlayerChange}>
            <SelectTrigger className="h-12 border-2 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
              <SelectValue placeholder="🔍 Sélectionner un joueur..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-[300px]">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Chargement des joueurs...
                </div>
              ) : players.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Aucun joueur disponible
                </div>
              ) : (
                players.map((player) => (
                  <SelectItem 
                    key={player.id} 
                    value={player.id}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                        {player.first_name?.[0]}{player.last_name?.[0]}
                      </div>
                      <span>{player.first_name} {player.last_name}</span>
                      {player.position && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {player.position}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Informations du joueur sélectionné */}
        {currentPlayer && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-4 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold shadow-lg">
                  {currentPlayer.first_name?.[0]}{currentPlayer.last_name?.[0]}
                </div>
                
                {/* Infos */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {currentPlayer.first_name} {currentPlayer.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {currentPlayer.position && (
                        <Badge className="bg-blue-500 text-white">
                          {currentPlayer.position}
                        </Badge>
                      )}
                      {currentPlayer.status && (
                        <Badge 
                          className={
                            currentPlayer.status === 'APTE' ? 'bg-green-500 text-white' :
                            currentPlayer.status === 'APTE_RESTRICTIONS' ? 'bg-yellow-500 text-white' :
                            currentPlayer.status === 'TEMP_INAPTE' ? 'bg-orange-500 text-white' :
                            'bg-red-500 text-white'
                          }
                        >
                          {currentPlayer.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats rapides */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-white/80 rounded-lg p-2 border border-blue-200">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <p className="text-xs text-slate-600">Âge</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {currentPlayer.birth_date
                          ? `${new Date().getFullYear() - new Date(currentPlayer.birth_date).getFullYear()} ans`
                          : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white/80 rounded-lg p-2 border border-purple-200">
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-purple-600" />
                        <p className="text-xs text-slate-600">Visites</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {playerVisits.length}
                      </p>
                    </div>
                    
                    <div className="bg-white/80 rounded-lg p-2 border border-green-200">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-slate-600">Club</p>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentPlayer.club || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dernières visites */}
            {playerVisits.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-white border-2 border-blue-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Dernières visites ({playerVisits.length})
                </h4>
                <div className="space-y-2">
                  {playerVisits.slice(0, 3).map((visit) => (
                    <div 
                      key={visit.id} 
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-600">
                          {new Date(visit.visit_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {visit.module}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Message si pas de visitId */}
        {selectedPlayer && !lastVisits.some(v => v.player_id === selectedPlayer) && (
          <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
            <p className="text-sm text-yellow-800">
              ℹ️ Aucune visite trouvée pour ce joueur. Créez une nouvelle visite pour commencer.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

