import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { PCMAForm } from '@/components/PCMAForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Heart, Activity, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerPCMA } from '../../hooks/usePCMA'

export default function PCMAPage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { visits } = useVisits()
  const { pcmaList, loading: pcmaLoading } = usePlayerPCMA(playerId)

  const handlePlayerSelect = (selectedPlayerId) => {
    setPlayerId(selectedPlayerId)
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-pink-50">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg text-4xl">
                  🏥
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Examen PCMA
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Pré-participation Cardiovascular Medical Assessment
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Examen</p>
                        <p className="font-semibold">Cardiovasculaire</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="font-semibold">Médical complet</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Module</p>
                        <p className="font-semibold">PCMA</p>
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
              moduleName="PCMA"
              moduleRoute="/modules/pcma"
            />

            {/* Historique PCMA du joueur */}
            {playerId && pcmaList.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Historique PCMA</CardTitle>
                      <CardDescription>
                        {pcmaList.length} examen{pcmaList.length > 1 ? 's' : ''} trouvé{pcmaList.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {pcmaList.slice(0, 5).map((pcma, index) => (
                      <div 
                        key={pcma.id} 
                        className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-600">Taille/Poids</p>
                            <p className="text-sm font-bold text-slate-900">
                              {pcma.height_cm ? `${pcma.height_cm} cm` : 'N/A'} / {pcma.weight_kg ? `${pcma.weight_kg} kg` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">IMC</p>
                            <p className="text-sm font-bold text-slate-900">
                              {pcma.bmi ? `${pcma.bmi} kg/m²` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">TA</p>
                            <p className="text-sm font-bold text-slate-900">
                              {pcma.bp_sys && pcma.bp_dia ? `${pcma.bp_sys}/${pcma.bp_dia}` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Aptitude</p>
                            <Badge className={
                              pcma.aptitude === 'APTE' ? 'bg-green-500' :
                              pcma.aptitude === 'APTE_RESTRICTIONS' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }>
                              {pcma.aptitude || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PCMA Form */}
            <PCMAForm 
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
