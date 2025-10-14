import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SoinsForm } from '@/components/SoinsForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Bandage, FileText, Calendar, MapPin, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePlayerSoins } from '@/hooks/useSoins'

export default function SoinsPage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { soinsList } = usePlayerSoins(playerId)

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

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 p-8 shadow-2xl">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <Bandage className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Soins & Traitements
                    </h1>
                    <p className="mt-2 text-lg text-rose-100">
                      Suivi des soins spécialisés et traitements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Selector */}
            <PlayerSelector
              selectedPlayerId={playerId}
              onPlayerSelect={handlePlayerSelect}
              moduleName="Soins & Traitements"
              moduleRoute="/modules/soins"
            />

            {playerId && soinsList.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-rose-600" />
                    Historique des soins
                  </CardTitle>
                  <CardDescription>
                    {soinsList.length} soin{soinsList.length > 1 ? 's' : ''} enregistré{soinsList.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {soinsList.slice(0, 5).map((soin) => (
                      <div 
                        key={soin.id}
                        className="p-4 rounded-lg border border-rose-100 bg-gradient-to-r from-rose-50/50 to-pink-50/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Bandage className="h-4 w-4 text-rose-600" />
                              <p className="font-medium text-slate-900">
                                {soin.type_soin || 'Soin'}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(soin.date_soin).toLocaleDateString('fr-FR')}
                              </span>
                              {soin.zone_concernee && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {soin.zone_concernee}
                                </span>
                              )}
                              {soin.resultat && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {soin.resultat}
                                </span>
                              )}
                            </div>
                            {soin.description && (
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {soin.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant="outline" className={
                              soin.statut === 'valide' ? 'border-green-500 text-green-700' : 'border-amber-500 text-amber-700'
                            }>
                              {soin.statut === 'valide' ? '✅ Validé' : '📝 Brouillon'}
                            </Badge>
                            {soin.resultat && (
                              <Badge className={
                                soin.resultat === 'amelioration' ? 'bg-green-500' :
                                soin.resultat === 'deterioration' ? 'bg-red-500' :
                                'bg-blue-500'
                              }>
                                {soin.resultat}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Soins Form - Always visible */}
            <SoinsForm 
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

