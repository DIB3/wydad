import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { GPSForm } from '@/components/GPSForm'
import { PlayerSelector } from '@/components/PlayerSelector'
import { ArrowLeft, Navigation, Activity, Map, Target, TrendingUp, Zap, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVisits } from '../../hooks/useVisits'
import { usePlayerGPS } from '../../hooks/useGPS'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

            {/* Graphiques d'analyse - Affichés uniquement si au moins 2 sessions */}
            {playerId && gpsList.length >= 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Analyse GPS
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    {gpsList.length} sessions
                  </Badge>
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Évolution des distances */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                          <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Évolution des distances</CardTitle>
                          <CardDescription>Distance totale par session</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={gpsList.map((gps, idx) => ({
                          session: `S${idx + 1}`,
                          distance: (gps.distance_m / 1000).toFixed(2),
                          hid: (gps.hid_m / 1000).toFixed(2)
                        })).reverse()}>
                          <defs>
                            <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="session" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #10b981',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Area type="monotone" dataKey="distance" stroke="#10b981" strokeWidth={3} fill="url(#distanceGradient)" name="Distance (km)" />
                          <Area type="monotone" dataKey="hid" stroke="#059669" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="HID (km)" />
                          <Legend />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Vitesses */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Vitesses</CardTitle>
                          <CardDescription>Vmax et vitesse moyenne</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={gpsList.map((gps, idx) => ({
                          session: `S${idx + 1}`,
                          vmax: gps.vmax_kmh,
                          vmoy: gps.avg_speed_kmh
                        })).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="session" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #06b6d4',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="vmax" 
                            stroke="#06b6d4" 
                            strokeWidth={3} 
                            name="Vmax (km/h)"
                            dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="vmoy" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            name="Vmoy (km/h)"
                            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                          />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Charge physique */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden md:col-span-2">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                          <Gauge className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Charge physique</CardTitle>
                          <CardDescription>Player Load et intensité</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={gpsList.map((gps, idx) => ({
                          session: `S${idx + 1}`,
                          playerLoad: gps.player_load,
                          accelerations: gps.acc_gt3_count,
                          decelerations: gps.decel_hard_count
                        })).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                          <XAxis dataKey="session" className="text-xs" stroke="#64748b" />
                          <YAxis className="text-xs" stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #f97316',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="playerLoad" fill="#f97316" radius={[8, 8, 0, 0]} name="Player Load" />
                          <Bar dataKey="accelerations" fill="#10b981" radius={[8, 8, 0, 0]} name="Accélérations" />
                          <Bar dataKey="decelerations" fill="#ef4444" radius={[8, 8, 0, 0]} name="Décélérations" />
                          <Legend />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

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
