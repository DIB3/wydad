import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, Clock, MapPin, Users, Loader2, FileText } from 'lucide-react'
import { useVisits } from '../hooks/useVisits'
import { usePlayers } from '../hooks/usePlayers'
import { format, isAfter, parseISO, isFuture, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Link } from 'react-router-dom'

const typeColors = {
  pcma: 'from-blue-500 to-blue-600',
  injury: 'from-red-500 to-red-600',
  gps: 'from-green-500 to-green-600',
  impedance: 'from-purple-500 to-purple-600',
  nutrition: 'from-orange-500 to-orange-600',
  care: 'from-cyan-500 to-cyan-600'
}

const moduleLabels = {
  pcma: 'PCMA',
  gps: 'GPS',
  impedance: 'Impédance',
  injury: 'Blessure',
  nutrition: 'Nutrition',
  care: 'Soins'
}

const statusBadges = {
  validated: { label: 'Validé', color: 'bg-green-100 text-green-800' },
  draft: { label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800' }
}

export function UpcomingEvents() {
  const { visits, loading } = useVisits()
  const { players } = usePlayers()

  // Filtrer les visites futures et les trier par date
  const upcomingVisits = visits
    .filter(visit => {
      const visitDate = parseISO(visit.visit_date)
      return isFuture(visitDate) || format(visitDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    })
    .sort((a, b) => parseISO(a.visit_date) - parseISO(b.visit_date))
    .slice(0, 5) // Limiter aux 5 prochaines

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId)
    return player ? `${player.first_name} ${player.last_name}` : 'Joueur inconnu'
  }

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="text-2xl">📅</div>
          <div>
            <CardTitle>Visites à venir</CardTitle>
            <CardDescription>Prochaines consultations planifiées</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#29BACD] mx-auto mb-4" />
            <p className="text-sm text-slate-500">Chargement des visites...</p>
          </div>
        ) : upcomingVisits.length > 0 ? (
          <div className="space-y-4">
            {upcomingVisits.map((visit) => {
              const visitDate = parseISO(visit.visit_date)
              const moduleType = visit.module || 'pcma'
              
              return (
                <Link 
                  key={visit.id}
                  to={`/visits`}
                  className="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#29BACD] hover:shadow-md transition-all bg-white group"
                >
                  {/* Date Badge */}
                  <div className="flex-shrink-0 text-center">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${typeColors[moduleType]} text-white flex flex-col items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <div className="text-xs font-medium">
                        {format(visitDate, 'MMM', { locale: fr }).toUpperCase()}
                      </div>
                      <div className="text-2xl font-bold">
                        {format(visitDate, 'd')}
                      </div>
                    </div>
                  </div>

                  {/* Visit Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">
                        {moduleLabels[moduleType]} - {getPlayerName(visit.player_id)}
                      </h4>
                      <Badge className={statusBadges[visit.status]?.color || statusBadges.draft.color}>
                        {statusBadges[visit.status]?.label || 'Brouillon'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{format(visitDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{format(visitDate, 'HH:mm', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="capitalize">{moduleLabels[moduleType]}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-sm text-slate-500">Aucune visite à venir</p>
            <p className="text-xs text-slate-400 mt-2">Les visites futures apparaîtront ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

