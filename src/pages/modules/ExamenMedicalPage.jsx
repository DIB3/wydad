import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ExamenMedicalForm } from '@/components/ExamenMedicalForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Stethoscope, FileText, Calendar, Thermometer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePlayerExamensMedicaux } from '@/hooks/useExamenMedical'

export default function ExamenMedicalPage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  const { examensMedicaux } = usePlayerExamensMedicaux(playerId)

  const handlePlayerSelect = (selectedPlayerId) => {
    setPlayerId(selectedPlayerId)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50">
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 p-8 shadow-2xl">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <Stethoscope className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Examen Médical
                    </h1>
                    <p className="mt-2 text-lg text-blue-100">
                      Consultation médicale pour affections courantes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Selector */}
            <PlayerSelector
              selectedPlayerId={playerId}
              onPlayerSelect={handlePlayerSelect}
              moduleName="Examen médical"
              moduleRoute="/modules/examen_medical"
            />

            {playerId && examensMedicaux.length > 0 && (
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Historique des examens médicaux
                  </CardTitle>
                  <CardDescription>
                    {examensMedicaux.length} examen{examensMedicaux.length > 1 ? 's' : ''} enregistré{examensMedicaux.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {examensMedicaux.slice(0, 5).map((examen) => (
                      <div 
                        key={examen.id}
                        className="p-4 rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-emerald-600" />
                              <p className="font-medium text-slate-900">
                                {examen.motif || 'Consultation'}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(examen.date_consultation).toLocaleDateString('fr-FR')}
                              </span>
                              {examen.temperature_c && (
                                <span className="flex items-center gap-1">
                                  <Thermometer className="h-3 w-3" />
                                  {examen.temperature_c}°C
                                </span>
                              )}
                            </div>
                            {examen.diagnostic && (
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {examen.diagnostic}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={
                              examen.type_consultation === 'urgence' ? 'bg-red-500' :
                              examen.type_consultation === 'suivi' ? 'bg-blue-500' :
                              'bg-green-500'
                            }>
                              {examen.type_consultation}
                            </Badge>
                            <Badge variant="outline" className={
                              examen.statut === 'valide' ? 'border-green-500 text-green-700' : 'border-amber-500 text-amber-700'
                            }>
                              {examen.statut === 'valide' ? '✅ Validé' : '📝 Brouillon'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Examen Medical Form - Always visible */}
            <ExamenMedicalForm 
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

