import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { GPSForm } from '@/components/GPSForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Navigation, Activity, Map, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerGPS } from '../../hooks/useGPS'

export default function GPSPage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { visits } = useVisits()
  const { gpsList } = usePlayerGPS(playerId)

  const handlePlayerSelect = (selectedPlayerId) => {
    setPlayerId(selectedPlayerId)
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-6 p-6">
            {/* Back Button */}
            <Button 
              variant="outline" 
              asChild 
              className="gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
              </Link>
            </Button>

            {/* Page Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg text-4xl">
                  📍
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                    Données GPS
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Enregistrement des données de performance GPS et charge physique
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                        <Navigation className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Technologie</p>
                        <p className="font-semibold">GPS</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Analyse</p>
                        <p className="font-semibold">Performance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                        <Map className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Suivi</p>
                        <p className="font-semibold">Charge physique</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Player Selector */}
            <PlayerSelector 
              selectedPlayerId={playerId}
              onPlayerSelect={handlePlayerSelect}
              lastVisits={visits}
              moduleName="GPS"
              moduleRoute="/modules/gps"
            />

            {/* Historique GPS */}
            {playerId && gpsList.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Historique GPS</CardTitle>
                      <CardDescription>
                        {gpsList.length} session{gpsList.length > 1 ? 's' : ''} trouvée{gpsList.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {gpsList.slice(0, 5).map((gps) => (
                      <div 
                        key={gps.id} 
                        className="p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-600">Distance</p>
                            <p className="text-sm font-bold text-slate-900">
                              {gps.distance_m ? `${(gps.distance_m / 1000).toFixed(2)} km` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Vitesse max</p>
                            <p className="text-sm font-bold text-slate-900">
                              {gps.vmax_kmh ? `${gps.vmax_kmh} km/h` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Sprints</p>
                            <p className="text-sm font-bold text-slate-900">
                              {gps.sprints_count || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Type</p>
                            <Badge variant="outline">
                              {gps.session_type || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* GPS Form */}
            <GPSForm 
              visitId={visitId} 
              playerId={playerId}
              moduleSequence={moduleSequence}
              currentModuleIndex={currentModuleIndex}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
