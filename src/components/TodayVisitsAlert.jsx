import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, ChevronRight, X } from 'lucide-react'
import { useVisits } from '../hooks/useVisits'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function TodayVisitsAlert() {
  const { visits } = useVisits()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  // Vérifier si déjà fermé aujourd'hui
  useEffect(() => {
    const dismissedToday = localStorage.getItem('todayVisitsAlertDismissed')
    if (dismissedToday) {
      const dismissDate = new Date(dismissedToday)
      const today = new Date()
      dismissDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      
      if (dismissDate.getTime() === today.getTime()) {
        setDismissed(true)
      }
    }
  }, [])

  // Filtrer les visites d'aujourd'hui
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayVisits = visits.filter(visit => {
    const visitDate = new Date(visit.visit_date)
    visitDate.setHours(0, 0, 0, 0)
    return visitDate.getTime() === today.getTime()
  })

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('todayVisitsAlertDismissed', new Date().toISOString())
  }

  const handleViewVisits = () => {
    navigate('/visits')
  }

  // Ne rien afficher si pas de visites aujourd'hui ou déjà fermé
  if (todayVisits.length === 0 || dismissed) return null

  // Grouper par joueur
  const visitsByPlayer = {}
  todayVisits.forEach(visit => {
    const playerName = `${visit.player?.first_name || ''} ${visit.player?.last_name || ''}`.trim() || 'Joueur inconnu'
    if (!visitsByPlayer[playerName]) {
      visitsByPlayer[playerName] = {
        modules: [],
        playerId: visit.player_id
      }
    }
    visitsByPlayer[playerName].modules.push(visit.module)
  })

  return (
    <Card className="shadow-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 overflow-hidden animate-in slide-in-from-top-4 duration-500">
      <CardContent className="p-0">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Calendar className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Visites programmées aujourd'hui</h3>
                <p className="text-xs text-blue-100">
                  {todayVisits.length} visite{todayVisits.length > 1 ? 's' : ''} à compléter
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Liste des visites */}
          <div className="p-4 space-y-3">
            {Object.entries(visitsByPlayer).map(([playerName, data], index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                    {playerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{playerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <p className="text-xs text-gray-600">
                        {data.modules.length} module{data.modules.length > 1 ? 's' : ''} : 
                        <span className="font-medium text-blue-700 ml-1">
                          {data.modules.map(m => m.toUpperCase()).join(', ')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                  À faire
                </Badge>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 border-t-2 border-blue-200">
            <Button
              onClick={handleViewVisits}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg group"
            >
              Voir toutes les visites d'aujourd'hui
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

