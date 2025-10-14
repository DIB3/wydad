import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, Download, Calendar, Users, Activity, 
  TrendingUp, AlertCircle, FileText, Heart, Navigation,
  Utensils, Scale, Zap, Target, Clock, Loader2, UserCircle, X
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { useState } from 'react'
import { useReportData } from '../hooks/useReportData'
import { usePlayers } from '../hooks/usePlayers'
import { toast } from 'sonner'

// Composant pour afficher "Aucune donnée"
const EmptyState = ({ message = "Aucune donnée disponible" }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-8">
    <div className="text-6xl mb-4 opacity-50">📊</div>
    <p className="text-slate-600 font-medium">{message}</p>
    <p className="text-slate-500 text-sm mt-2">Les données apparaîtront une fois que des visites seront créées</p>
  </div>
)

// Wrapper pour graphiques avec gestion de données vides
const ChartWrapper = ({ data, children, emptyMessage }) => {
  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />
  }
  return <>{children}</>
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('6months')
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  
  // Calculer les dates en fonction de la période sélectionnée
  const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(startDate.getMonth() - 6)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }
  
  const { startDate, endDate } = getDateRange()
  
  const { 
    stats,
    visitsEvolution, 
    visitsByModule, 
    statusDistribution, 
    injuriesEvolution,
    impedanceData,
    gpsData,
    averageIMC,
    performanceRadar,
    certificatesExpiry,
    recentVisits,
    loading, 
    error 
  } = useReportData(selectedPlayerId, startDate, endDate)
  
  const { players } = usePlayers()

  // Fonction pour exporter en PDF
  const handleExportPDF = () => {
    toast.loading('Préparation de l\'export PDF...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('Export PDF démarré !', {
        description: 'Le téléchargement va commencer dans quelques instants'
      })
      // Pour l'instant on utilise print()
      window.print()
    }, 1000)
  }

  // Fonction pour gérer le changement de période
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    const periodLabels = {
      '1month': 'Dernier mois',
      '3months': '3 derniers mois',
      '6months': '6 derniers mois',
      '1year': 'Année complète'
    }
    toast.info('Période mise à jour', {
      description: `Affichage des données pour : ${periodLabels[newPeriod]}`
    })
  }

  // Si chargement
  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Chargement des rapports...</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Si erreur
  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Erreur lors du chargement des rapports</p>
                <p className="text-slate-500 text-sm mt-2">{error}</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Préparer les données pour les graphiques - UNIQUEMENT données API
  const visitsPerMonthData = visitsEvolution.map(v => ({
    mois: v.month,
    visites: v.visits
  }))

  const fitnessStatusData = statusDistribution.map(s => ({
    status: s.status,
    count: s.count,
    color: s.status === 'APTE' ? '#10b981' : 
           s.status === 'APTE_RESTRICTIONS' ? '#eab308' :
           s.status === 'TEMP_INAPTE' ? '#f97316' : '#ef4444'
  }))

  const injuryTrendsData = injuriesEvolution
  
  const moduleUsageData = visitsByModule.map(m => ({
    module: m.module,
    visites: m.count,
    color: m.module === 'PCMA' ? '#3b82f6' :
           m.module === 'GPS' ? '#8b5cf6' :
           m.module === 'Impédancemétrie' ? '#a855f7' :
           m.module === 'Nutrition' ? '#f97316' : '#ef4444'
  }))

  // Données IMC de l'API uniquement
  const avgImcData = averageIMC

  // Données radar de l'API uniquement
  const performanceRadarData = performanceRadar

  // Données certificats de l'API uniquement
  const certificatesExpiryData = certificatesExpiry

  const kpis = {
    totalVisits: stats?.visitsThisMonth || 0,
    fitnessRate: stats?.fitnessRate || 0,
    activeInjuries: injuriesEvolution.reduce((sum, item) => sum + (item.injuries || 0), 0),
    activePlayers: stats?.activePlayers || 0
  }
  
  const selectedPlayer = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          
          {/* Fond animé */}
          <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="absolute inset-0 z-0 opacity-30">
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <main className="relative z-10 space-y-6 p-6">
              {/* Header */}
              <div className="flex items-center justify-between backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-white/20 shadow-xl">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    📊 Rapports et Statistiques
                  </h1>
                  <p className="text-slate-600 mt-2">Vue d&apos;ensemble des données médicales et performances</p>
                </div>
                <div className="flex gap-3">
                  <Select value={period} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-48 h-11 border-2 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1month">📅 Dernier mois</SelectItem>
                      <SelectItem value="3months">📅 3 derniers mois</SelectItem>
                      <SelectItem value="6months">📅 6 derniers mois</SelectItem>
                      <SelectItem value="1year">📅 Année complète</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="gap-2 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-xl"
                    onClick={handleExportPDF}
                  >
                    <Download className="h-4 w-4" />
                    Exporter PDF
                  </Button>
                </div>
              </div>

              {/* Filtre par joueur */}
              <Card className="border-2 border-primary/20 bg-gradient-to-r from-white to-blue-50/50 shadow-lg backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
                        <UserCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Filtrer par joueur</CardTitle>
                        <CardDescription>Sélectionnez un joueur pour des statistiques détaillées</CardDescription>
                      </div>
                    </div>
                    {selectedPlayerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlayerId(null)}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Voir tous les joueurs
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Select value={selectedPlayerId || 'all'} onValueChange={(value) => setSelectedPlayerId(value === 'all' ? null : value)}>
                    <SelectTrigger className="h-12 text-base border-2 hover:border-primary transition-colors">
                      <SelectValue placeholder="Tous les joueurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span>Tous les joueurs</span>
                        </div>
                      </SelectItem>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                              {player.first_name?.[0]}{player.last_name?.[0]}
                            </div>
                            <span className="font-medium">{player.first_name} {player.last_name}</span>
                            <span className="text-muted-foreground text-xs">- {player.position || 'Sans poste'}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlayer && (
                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-blue-900 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Rapport détaillé pour <span className="font-bold">{selectedPlayer.first_name} {selectedPlayer.last_name}</span>
                        <span className="text-blue-600">• {selectedPlayer.position || 'Sans poste'}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* KPIs Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:h-3 transition-all" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Total visites</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{kpis.totalVisits}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">Sur la période</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:h-3 transition-all" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Taux d&apos;aptitude</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{kpis.fitnessRate}%</p>
                        <p className="text-xs text-green-600 font-medium mt-1">Joueurs aptes</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500 group-hover:h-3 transition-all" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Blessures actives</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">{kpis.activeInjuries}</p>
                        <p className="text-xs text-red-600 font-medium mt-1">Dernier mois</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/80 border-none shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:h-3 transition-all" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Joueurs actifs</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{kpis.activePlayers}</p>
                        <p className="text-xs text-purple-600 font-medium mt-1">Dans l'effectif</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs pour différents rapports */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white/80 backdrop-blur-sm p-1 h-auto rounded-xl shadow-lg">
                  <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    <BarChart3 className="h-4 w-4" />
                    Vue d&apos;ensemble
                  </TabsTrigger>
                  <TabsTrigger value="medical" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                    <Heart className="h-4 w-4" />
                    Médical
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                    <Zap className="h-4 w-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="injuries" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                    <AlertCircle className="h-4 w-4" />
                    Blessures
                  </TabsTrigger>
                </TabsList>

                {/* Vue d'ensemble */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Visites par module */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            <BarChart3 className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>Visites par module</CardTitle>
                            <CardDescription>Évolution mensuelle par type de consultation</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ChartWrapper data={visitsPerMonthData} emptyMessage="Aucune donnée de visites disponible">
                          <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={visitsPerMonthData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="mois" className="text-xs" stroke="#64748b" />
                              <YAxis className="text-xs" stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: '12px',
                                  border: '2px solid #3b82f6',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Legend />
                              <Bar dataKey="visites" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Visites" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartWrapper>
                      </CardContent>
                    </Card>

                    {/* États d'aptitude */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>Répartition états d&apos;aptitude</CardTitle>
                            <CardDescription>Statut actuel de tous les joueurs</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ChartWrapper data={fitnessStatusData} emptyMessage="Aucune donnée de statuts disponible">
                          <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                              <Pie
                                data={fitnessStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {fitnessStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: '12px',
                                  border: '2px solid #10b981',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartWrapper>
                      </CardContent>
                    </Card>

                    {/* Tendance blessures */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-red-500" />
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>Tendance des blessures</CardTitle>
                            <CardDescription>Blessures vs Disponibilité</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ChartWrapper data={injuryTrendsData} emptyMessage="Aucune donnée de blessures disponible">
                          <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={injuryTrendsData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="month" className="text-xs" stroke="#64748b" />
                              <YAxis className="text-xs" stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: '12px',
                                  border: '2px solid #f97316',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="injuries" 
                                stroke="#ef4444" 
                                strokeWidth={3}
                                dot={{ fill: '#ef4444', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                name="Blessures"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartWrapper>
                      </CardContent>
                    </Card>

                    {/* Performance globale */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>Performance globale équipe</CardTitle>
                            <CardDescription>Indicateurs clés de santé</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ChartWrapper data={performanceRadarData} emptyMessage="Aucune donnée de performance disponible">
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={performanceRadarData}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="metric" className="text-xs" stroke="#64748b" />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" stroke="#64748b" />
                              <Radar 
                                name="Performance" 
                                dataKey="value" 
                                stroke="#a855f7" 
                                fill="#a855f7" 
                                fillOpacity={0.5}
                                strokeWidth={3}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: '12px',
                                  border: '2px solid #a855f7',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </ChartWrapper>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Usage des modules - Pleine largeur */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Utilisation des modules</CardTitle>
                          <CardDescription>Nombre de consultations par module sur la période</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                      <CardContent className="p-6">
                        <ChartWrapper data={moduleUsageData} emptyMessage="Aucune donnée de modules disponible">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={moduleUsageData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis type="number" className="text-xs" stroke="#64748b" />
                              <YAxis dataKey="module" type="category" width={120} className="text-sm" stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: '12px',
                                  border: '2px solid #06b6d4',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Bar dataKey="visites" radius={[0, 8, 8, 0]} name="Nombre de visites">
                                {moduleUsageData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartWrapper>
                      </CardContent>
                  </Card>
                </TabsContent>

                {/* Rapport médical */}
                <TabsContent value="medical" className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* IMC moyen */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                            <Scale className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>IMC moyen de l&apos;équipe</CardTitle>
                            <CardDescription>Évolution avec min/max</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ChartWrapper data={avgImcData} emptyMessage="Aucune donnée d'IMC disponible">
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={avgImcData}>
                              <defs>
                                <linearGradient id="imcAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="mois" className="text-xs" stroke="#64748b" />
                              <YAxis domain={[20, 26]} className="text-xs" stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: '12px',
                                  border: '2px solid #3b82f6',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Legend />
                              <Area 
                                type="monotone" 
                                dataKey="moyenne" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fill="url(#imcAreaGradient)"
                                name="IMC moyen"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="min" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Min"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="max" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Max"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartWrapper>
                      </CardContent>
                    </Card>

                    {/* Certificats */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>Certificats médicaux</CardTitle>
                            <CardDescription>Validité et expiration</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ChartWrapper data={certificatesExpiryData} emptyMessage="Aucune donnée de certificats disponible">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={certificatesExpiryData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="periode" className="text-xs" stroke="#64748b" />
                              <YAxis className="text-xs" stroke="#64748b" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: '12px',
                                  border: '2px solid #f59e0b',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Legend />
                              <Bar dataKey="expirent" fill="#eab308" radius={[8, 8, 0, 0]} name="Expirent bientôt" />
                              <Bar dataKey="expires" fill="#ef4444" radius={[8, 8, 0, 0]} name="Expirés" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartWrapper>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Composition corporelle (Impédance) */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          <Scale className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Composition corporelle</CardTitle>
                          <CardDescription>
                            {selectedPlayerId ? 'Données du joueur sélectionné' : 'Moyenne de tous les joueurs'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ChartWrapper 
                        data={impedanceData} 
                        emptyMessage={selectedPlayerId ? "Aucune donnée d'impédance pour ce joueur" : "Aucune donnée d'impédance disponible"}
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={impedanceData}>
                            <defs>
                              <linearGradient id="massGrasseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="massMaigreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="eauGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                            <XAxis dataKey="date" className="text-xs" stroke="#64748b" />
                            <YAxis className="text-xs" stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: '12px',
                                border: '2px solid #a855f7',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="masse_grasse" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                              fill="url(#massGrasseGradient)"
                              name="Masse grasse (kg)"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="masse_maigre" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              fill="url(#massMaigreGradient)"
                              name="Masse maigre (kg)"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="eau" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              fill="url(#eauGradient)"
                              name="Eau (L)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        <p className="text-center text-slate-500 text-sm mt-4">
                          📊 {selectedPlayerId ? 'Évolution du joueur sélectionné' : 'Moyenne de composition de tous les joueurs'} - 6 derniers mois
                        </p>
                      </ChartWrapper>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Rapport performance */}
                <TabsContent value="performance" className="space-y-6">
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                          <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Performance GPS</CardTitle>
                          <CardDescription>Données GPS {selectedPlayerId ? 'du joueur sélectionné' : 'de l\'équipe'}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ChartWrapper 
                        data={gpsData} 
                        emptyMessage={selectedPlayerId ? "Aucune donnée GPS pour ce joueur" : "Aucune donnée GPS disponible"}
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={gpsData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                            <XAxis dataKey="date" className="text-xs" stroke="#64748b" />
                            <YAxis className="text-xs" stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: '12px',
                                border: '2px solid #10b981',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="distance" stroke="#10b981" strokeWidth={3} name="Distance (m)" />
                            <Line type="monotone" dataKey="vitesse_max" stroke="#f97316" strokeWidth={3} name="Vitesse max (km/h)" />
                            <Line type="monotone" dataKey="charge" stroke="#8b5cf6" strokeWidth={3} name="Charge" />
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-center text-slate-500 text-sm mt-4">
                          📊 {selectedPlayerId ? 'Données GPS du joueur sélectionné' : 'Moyenne GPS de tous les joueurs'} - 8 dernières semaines
                        </p>
                      </ChartWrapper>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Rapport blessures */}
                <TabsContent value="injuries" className="space-y-6">
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />
                    <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>Évolution des blessures</CardTitle>
                          <CardDescription>Tendance des blessures sur 6 mois</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ChartWrapper data={injuryTrendsData} emptyMessage="Aucune donnée de blessures disponible">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={injuryTrendsData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                            <XAxis dataKey="month" className="text-xs" stroke="#64748b" />
                            <YAxis className="text-xs" stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: '12px',
                                border: '2px solid #ef4444',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="injuries" 
                              stroke="#ef4444" 
                              strokeWidth={3}
                              dot={{ fill: '#ef4444', r: 6 }}
                              name="Nombre de blessures"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartWrapper>
                      
                      {/* Statistiques de blessures */}
                      {injuryTrendsData.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-3 mt-6">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 text-center">
                            <p className="text-xs text-slate-600 font-medium mb-1">Total blessures</p>
                            <p className="text-3xl font-bold text-red-600">
                              {injuryTrendsData.reduce((sum, item) => sum + (item.injuries || 0), 0)}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 text-center">
                            <p className="text-xs text-slate-600 font-medium mb-1">Moyenne par mois</p>
                            <p className="text-3xl font-bold text-orange-600">
                              {injuryTrendsData.length > 0 
                                ? Math.round(injuryTrendsData.reduce((sum, item) => sum + (item.injuries || 0), 0) / injuryTrendsData.length)
                                : 0}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
                            <p className="text-xs text-slate-600 font-medium mb-1">Période</p>
                            <p className="text-xl font-bold text-purple-600">6 mois</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

