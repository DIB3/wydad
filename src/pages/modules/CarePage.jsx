import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { CareForm } from '@/components/CareForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Stethoscope, Zap, Heart, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerCare } from '../../hooks/useCare'

export default function CarePage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { visits } = useVisits()
  const { careList } = usePlayerCare(playerId)

  const handlePlayerSelect = (selectedPlayerId) => {
    setPlayerId(selectedPlayerId)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-cyan-50 via-white to-blue-50">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg text-4xl">
                  🏥
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Soins et Récupération
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Gestion des soins thérapeutiques et de la récupération
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="font-semibold">Soins thérapeutiques</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Catégories</p>
                        <p className="font-semibold">10 équipements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Objectif</p>
                        <p className="font-semibold">Récupération</p>
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
                  moduleName="Soins"
                  moduleRoute="/modules/care"
                />

            {/* Historique Soins */}
            {playerId && careList.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Historique Soins</CardTitle>
                      <CardDescription>
                        {careList.length} séance{careList.length > 1 ? 's' : ''} trouvée{careList.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {careList.slice(0, 5).map((care) => (
                      <div 
                        key={care.id} 
                        className="p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-xl border-2 border-cyan-200 hover:border-cyan-400 transition-all"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-600">Date</p>
                            <p className="text-sm font-bold text-slate-900">
                              {care.care_date ? new Date(care.care_date).toLocaleDateString('fr-FR') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Durée</p>
                            <p className="text-sm font-bold text-slate-900">
                              {care.duration_min ? `${care.duration_min} min` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Douleur</p>
                            <p className="text-sm font-bold text-slate-900">
                              {care.pain_level_before}/{care.pain_level_after} → 
                              <Badge className="ml-1 bg-green-500">
                                {care.pain_level_before && care.pain_level_after 
                                  ? `-${care.pain_level_before - care.pain_level_after}` 
                                  : 'N/A'}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">État</p>
                            <Badge variant="outline">
                              {care.overall_condition || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Care Form */}
            <CareForm 
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

