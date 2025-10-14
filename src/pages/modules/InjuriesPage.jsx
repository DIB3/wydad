import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { InjuryForm } from '@/components/InjuryForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, AlertCircle, Heart, Activity, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerInjuries } from '../../hooks/useInjuries'

export default function InjuriesPage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { visits } = useVisits()
  const { injuriesList } = usePlayerInjuries(playerId)

  const handlePlayerSelect = (selectedPlayerId) => {
    setPlayerId(selectedPlayerId)
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-red-50">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg text-4xl">
                  🩹
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Gestion des Blessures
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Enregistrement et suivi des blessures sportives
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="font-semibold">Blessures</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Suivi</p>
                        <p className="font-semibold">Soins</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Récupération</p>
                        <p className="font-semibold">Rééducation</p>
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
              moduleName="Blessures"
              moduleRoute="/modules/injuries"
            />

            {/* Historique Blessures */}
            {playerId && injuriesList.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Historique Blessures</CardTitle>
                      <CardDescription>
                        {injuriesList.length} blessure{injuriesList.length > 1 ? 's' : ''} trouvée{injuriesList.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {injuriesList.slice(0, 5).map((injury) => (
                      <div 
                        key={injury.id} 
                        className="p-4 bg-gradient-to-r from-slate-50 to-red-50 rounded-xl border-2 border-red-200 hover:border-red-400 transition-all"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-600">Type</p>
                            <p className="text-sm font-bold text-slate-900">
                              {injury.type || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Localisation</p>
                            <p className="text-sm font-bold text-slate-900">
                              {injury.location || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Gravité</p>
                            <Badge className={
                              injury.severity === 'minor' ? 'bg-yellow-500' :
                              injury.severity === 'moderate' ? 'bg-orange-500' :
                              'bg-red-500'
                            }>
                              {injury.severity || 'N/A'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Statut</p>
                            <Badge variant="outline">
                              {injury.recovery_status || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Injury Form */}
            <InjuryForm 
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
