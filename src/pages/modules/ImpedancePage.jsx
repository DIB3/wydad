import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ImpedanceForm } from '@/components/ImpedanceForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Zap, Scale, TrendingUp, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerImpedance } from '../../hooks/useImpedance'

export default function ImpedancePage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { visits } = useVisits()
  const { impedanceList } = usePlayerImpedance(playerId)

  const handlePlayerSelect = (selectedPlayerId) => {
    setPlayerId(selectedPlayerId)
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-yellow-50">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg text-4xl">
                  ⚡
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    Impédancemétrie
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Analyse de la composition corporelle par bioimpédance
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Méthode</p>
                        <p className="font-semibold">Bioimpédance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                        <Scale className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mesure</p>
                        <p className="font-semibold">Composition</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Suivi</p>
                        <p className="font-semibold">Évolution</p>
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
              moduleName="Impédancemétrie"
              moduleRoute="/modules/impedance"
            />

            {/* Historique Impédance */}
            {playerId && impedanceList.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Historique Impédancemétrie</CardTitle>
                      <CardDescription>
                        {impedanceList.length} mesure{impedanceList.length > 1 ? 's' : ''} trouvée{impedanceList.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {impedanceList.slice(0, 5).map((imp) => (
                      <div 
                        key={imp.id} 
                        className="p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-600">Poids/IMC</p>
                            <p className="text-sm font-bold text-slate-900">
                              {imp.weight_kg ? `${imp.weight_kg} kg` : 'N/A'} / {imp.bmi ? `${imp.bmi}` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Masse grasse</p>
                            <p className="text-sm font-bold text-slate-900">
                              {imp.body_fat_percent ? `${imp.body_fat_percent}%` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Masse maigre</p>
                            <p className="text-sm font-bold text-slate-900">
                              {imp.lean_mass_kg ? `${imp.lean_mass_kg} kg` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Hydratation</p>
                            <p className="text-sm font-bold text-slate-900">
                              {imp.hydration_percent ? `${imp.hydration_percent}%` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Impedance Form */}
            <ImpedanceForm 
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
