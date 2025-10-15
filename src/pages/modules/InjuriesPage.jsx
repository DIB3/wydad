import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { InjuryForm } from '@/components/InjuryForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, AlertCircle, Heart, Activity, Target, TrendingUp, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerInjuries } from '../../hooks/useInjuries'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function InjuriesPage() {
  const location = useLocation()
  const initialVisitId = location.state?.visitId
  const initialPlayerId = location.state?.playerId
  const moduleSequence = location.state?.moduleSequence
  const currentModuleIndex = location.state?.currentModuleIndex
  
  const [visitId, setVisitId] = useState(initialVisitId)
  const [playerId, setPlayerId] = useState(initialPlayerId)
  
  // Debug
  
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

            {/* Graphiques d'analyse - Affichés uniquement si au moins 2 blessures */}
            {playerId && injuriesList.length >= 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                  Analyse des blessures
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    {injuriesList.length} blessures
                  </Badge>
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Types de blessures */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Types de blessures</CardTitle>
                          <CardDescription>Répartition par type</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const typeCount = {}
                              injuriesList.forEach(injury => {
                                if (injury.type) {
                                  typeCount[injury.type] = (typeCount[injury.type] || 0) + 1
                                }
                              })
                              return Object.entries(typeCount).map(([name, value]) => ({
                                name,
                                value,
                                percentage: ((value / injuriesList.length) * 100).toFixed(0)
                              }))
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(() => {
                              const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16']
                              const typeCount = {}
                              injuriesList.forEach(injury => {
                                if (injury.type) typeCount[injury.type] = (typeCount[injury.type] || 0) + 1
                              })
                              return Object.keys(typeCount).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))
                            })()}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gravité des blessures */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Gravité</CardTitle>
                          <CardDescription>Répartition par niveau</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={(() => {
                          const severityCount = { 'legere': 0, 'moderee': 0, 'grave': 0 }
                          injuriesList.forEach(injury => {
                            if (injury.severity && severityCount.hasOwnProperty(injury.severity)) {
                              severityCount[injury.severity]++
                            }
                          })
                          return [
                            { name: 'Légère', count: severityCount.legere, fill: '#84cc16' },
                            { name: 'Modérée', count: severityCount.moderee, fill: '#f97316' },
                            { name: 'Grave', count: severityCount.grave, fill: '#ef4444' }
                          ]
                        })()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="name" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #f97316',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Nombre">
                            {[0, 1, 2].map((index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#84cc16' : index === 1 ? '#f97316' : '#ef4444'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Localisation des blessures */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Localisation</CardTitle>
                          <CardDescription>Zones touchées</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const locationCount = {}
                              injuriesList.forEach(injury => {
                                if (injury.location) {
                                  locationCount[injury.location] = (locationCount[injury.location] || 0) + 1
                                }
                              })
                              return Object.entries(locationCount).map(([name, value]) => ({
                                name,
                                value,
                                percentage: ((value / injuriesList.length) * 100).toFixed(0)
                              }))
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(() => {
                              const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f43f5e']
                              const locationCount = {}
                              injuriesList.forEach(injury => {
                                if (injury.location) locationCount[injury.location] = (locationCount[injury.location] || 0) + 1
                              })
                              return Object.keys(locationCount).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))
                            })()}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Statut de récupération */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Statut de récupération</CardTitle>
                          <CardDescription>État actuel</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={(() => {
                          const statusCount = {}
                          injuriesList.forEach(injury => {
                            const status = injury.recovery_status || 'Non défini'
                            statusCount[status] = (statusCount[status] || 0) + 1
                          })
                          return Object.entries(statusCount).map(([name, count]) => ({
                            name,
                            count
                          }))
                        })()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="name" className="text-xs" stroke="#64748b" angle={-15} textAnchor="end" height={60} />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #10b981',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} name="Nombre" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

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
