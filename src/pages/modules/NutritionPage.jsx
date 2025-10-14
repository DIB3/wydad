import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { NutritionForm } from '@/components/NutritionForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Utensils, Apple, TrendingUp, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerNutrition } from '../../hooks/useNutrition'

export default function NutritionPage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { visits } = useVisits()
  const { nutritionList } = usePlayerNutrition(playerId)

  const handlePlayerSelect = (selectedPlayerId) => {
    setPlayerId(selectedPlayerId)
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-green-50">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg text-4xl">
                  🥗
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Consultation Nutritionnelle
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Évaluation et plan nutritionnel pour sportifs
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <Utensils className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="font-semibold">Nutrition</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <Apple className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Programme</p>
                        <p className="font-semibold">Alimentaire</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-100 text-lime-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Suivi</p>
                        <p className="font-semibold">Performance</p>
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
              moduleName="Nutrition"
              moduleRoute="/modules/nutrition"
            />

            {/* Historique Nutrition */}
            {playerId && nutritionList.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                      <Apple className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Historique Nutrition</CardTitle>
                      <CardDescription>
                        {nutritionList.length} plan{nutritionList.length > 1 ? 's' : ''} trouvé{nutritionList.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {nutritionList.slice(0, 5).map((nutrition) => (
                      <div 
                        key={nutrition.id} 
                        className="p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-600">Calories</p>
                            <p className="text-sm font-bold text-slate-900">
                              {nutrition.kcal_target ? `${nutrition.kcal_target} kcal` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Protéines</p>
                            <p className="text-sm font-bold text-slate-900">
                              {nutrition.protein_g ? `${nutrition.protein_g} g` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Glucides</p>
                            <p className="text-sm font-bold text-slate-900">
                              {nutrition.carbs_g ? `${nutrition.carbs_g} g` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Hydratation</p>
                            <p className="text-sm font-bold text-slate-900">
                              {nutrition.hydration_l ? `${nutrition.hydration_l} L` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nutrition Form */}
            <NutritionForm 
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
