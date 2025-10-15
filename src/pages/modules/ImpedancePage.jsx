import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ImpedanceForm } from '@/components/ImpedanceForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Zap, Scale, TrendingUp, Activity, Droplets, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerImpedance } from '../../hooks/useImpedance'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

            {/* Graphiques d'analyse - Affichés uniquement si au moins 2 mesures */}
            {playerId && impedanceList.length >= 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                  Analyse de la Composition Corporelle
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                    {impedanceList.length} mesures
                  </Badge>
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Évolution du poids et IMC */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                          <Scale className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Poids et IMC</CardTitle>
                          <CardDescription>Évolution du poids corporel et indice de masse corporelle</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={impedanceList.map((imp, idx) => ({
                          mesure: `M${idx + 1}`,
                          poids: imp.weight_kg,
                          imc: imp.bmi
                        })).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="mesure" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #3b82f6',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="poids" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            name="Poids (kg)"
                            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="imc" 
                            stroke="#06b6d4" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            name="IMC"
                            dot={{ fill: '#06b6d4', r: 4, strokeWidth: 2, stroke: '#fff' }}
                          />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Composition corporelle */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Masses Corporelles</CardTitle>
                          <CardDescription>Masse grasse, maigre et musculaire</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={impedanceList.map((imp, idx) => ({
                          mesure: `M${idx + 1}`,
                          grasse: imp.body_fat_percent,
                          maigre: imp.lean_mass_kg,
                          musculaire: imp.muscle_mass_kg
                        })).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="mesure" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #a855f7',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="grasse" fill="#ef4444" radius={[8, 8, 0, 0]} name="Masse grasse (%)" />
                          <Bar dataKey="maigre" fill="#10b981" radius={[8, 8, 0, 0]} name="Masse maigre (kg)" />
                          <Bar dataKey="musculaire" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Masse musculaire (kg)" />
                          <Legend />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Hydratation */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                          <Droplets className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Hydratation</CardTitle>
                          <CardDescription>Taux d'hydratation corporelle</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={impedanceList.map((imp, idx) => ({
                          mesure: `M${idx + 1}`,
                          hydratation: imp.hydration_percent
                        })).reverse()}>
                          <defs>
                            <linearGradient id="hydrationGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="mesure" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" domain={[50, 70]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #06b6d4',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="hydratation" 
                            stroke="#06b6d4" 
                            strokeWidth={3} 
                            fill="url(#hydrationGradient)"
                            name="Hydratation (%)"
                          />
                          <Legend />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Métabolisme de base */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Métabolisme de Base</CardTitle>
                          <CardDescription>Dépense énergétique au repos (BMR)</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={impedanceList.map((imp, idx) => ({
                          mesure: `M${idx + 1}`,
                          bmr: imp.bmr
                        })).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="mesure" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #f97316',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="bmr" 
                            stroke="#f97316" 
                            strokeWidth={3} 
                            name="BMR (kcal/jour)"
                            dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                          />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

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
