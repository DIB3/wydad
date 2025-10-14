import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/StatusBadge'
import { QuickActions } from '@/components/QuickActions'
import { NotificationsPanel } from '@/components/NotificationsPanel'
import { UpcomingEvents } from '@/components/UpcomingEvents'
import { TodayVisitsAlert } from '@/components/TodayVisitsAlert'
import { Users, ClipboardList, AlertTriangle, TrendingUp, Plus, ArrowUpRight, Calendar, Activity, Sparkles, Loader2, UserCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useReportData } from '../hooks/useReportData'
import { usePlayers } from '../hooks/usePlayers'
import { useAuth } from '../contexts/AuthContext'
import { useTodayScheduledVisits } from '../hooks/useTodayScheduledVisits'

export default function Dashboard() {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  const { 
    stats, 
    visitsEvolution, 
    statusDistribution, 
    recentVisits,
    loading, 
    error 
  } = useReportData(selectedPlayerId)
  
  // Vérifier les visites programmées pour aujourd'hui
  useTodayScheduledVisits()
  const { players } = usePlayers()
  const { user } = useAuth()

  // Données pour les graphiques
  const visitsData = visitsEvolution

  // Si les données sont en chargement
  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Chargement des statistiques...</p>
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
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Erreur lors du chargement des statistiques</p>
                <p className="text-slate-500 text-sm mt-2">{error}</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Préparer les données KPI depuis l'API avec thème Wydad
  const kpiData = [
    {
      title: 'Joueurs actifs',
      value: stats?.activePlayers || 0,
      emoji: '👥',
      icon: Users,
      trend: `${stats?.activePlayers || 0} total`,
      bgGradient: 'from-primary to-destructive',
    },
    {
      title: 'Visites ce mois',
      value: stats?.visitsThisMonth || 0,
      emoji: '📋',
      icon: ClipboardList,
      trend: `${stats?.visitsThisMonth > stats?.visitsLastMonth ? '+' : ''}${(stats?.visitsThisMonth || 0) - (stats?.visitsLastMonth || 0)} vs mois dernier`,
      bgGradient: 'from-destructive to-primary',
    },
    {
      title: 'Certificats à renouveler',
      value: stats?.certificatesToRenew || 0,
      emoji: '⚠️',
      icon: AlertTriangle,
      trend: 'Dans les 30 jours',
      alert: (stats?.certificatesToRenew || 0) > 0,
      bgGradient: 'from-primary to-destructive',
    },
    {
      title: "Taux d'aptitude",
      value: `${stats?.fitnessRate || 0}%`,
      emoji: '📈',
      icon: TrendingUp,
      trend: 'Joueurs aptes',
      bgGradient: 'from-destructive to-primary',
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative overflow-hidden">
        {/* Background avec thème Wydad */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-destructive/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'url(/backgrounds/medical-pattern.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4
          }}></div>
          {/* Overlay animé Wydad */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 animate-pulse" style={{ animationDuration: '8s' }}></div>
        </div>
        
        <AppSidebar />
        <div className="flex flex-1 flex-col relative z-10">
          <AppHeader />
          <main className="flex-1 space-y-6 p-6">
            {/* Welcome Header Amélioré avec animation et badge professionnel */}
            <div className="flex items-center justify-between backdrop-blur-sm bg-white/60 p-6 rounded-2xl border border-white/20 shadow-xl relative overflow-hidden">
              {/* Motif médical en arrière-plan */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 text-6xl">⚕️</div>
                <div className="absolute bottom-4 right-4 text-6xl">🏥</div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-30">🩺</div>
              </div>
              
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  {(user?.role === 'ADMIN' || user?.role === 'MEDECIN') && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-destructive text-white text-sm font-semibold shadow-lg">
                      <span>🩺</span>
                      <span>Médecin du Sport</span>
                    </div>
                  )}
                  {user?.role === 'KINESITHERAPEUTE' && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-destructive to-primary text-white text-sm font-semibold shadow-lg">
                      <span>💆</span>
                      <span>Kinésithérapeute</span>
                    </div>
                  )}
                  {user?.role === 'NUTRITIONNISTE' && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-destructive text-white text-sm font-semibold shadow-lg">
                      <span>🥗</span>
                      <span>Nutritionniste</span>
                    </div>
                  )}
                  {user?.role === 'PREPARATEUR_PHYSIQUE' && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-destructive to-primary text-white text-sm font-semibold shadow-lg">
                      <span>💪</span>
                      <span>Préparateur Physique</span>
                    </div>
                  )}
                </div>
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-destructive to-primary bg-clip-text text-transparent animate-gradient">
                  Bienvenue, {user?.role === 'ADMIN' || user?.role === 'MEDECIN' ? 'Dr. ' : ''}{user?.first_name} {user?.last_name} !
                </h1>
                <p className="text-lg text-slate-600 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Sparkles className="h-4 w-4 text-destructive animate-pulse" />
                  <span className="text-sm text-slate-500">Excellente journée pour soigner les champions du Wydad ! 🏆</span>
                </div>
              </div>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-destructive hover:from-destructive hover:to-primary text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative z-10" asChild>
                <Link to="/visits/new">
                  <Plus className="h-5 w-5" />
                  Nouvelle visite
                </Link>
              </Button>
            </div>

            {/* Filtre par joueur */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-white to-primary/5 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center shadow-md">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Filtrer les statistiques</CardTitle>
                      <CardDescription>Sélectionnez un joueur pour voir ses données spécifiques</CardDescription>
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
                      Réinitialiser
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
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-destructive flex items-center justify-center text-white font-semibold text-xs">
                            {player.first_name?.[0]}{player.last_name?.[0]}
                          </div>
                          <span className="font-medium">{player.first_name} {player.last_name}</span>
                          <span className="text-muted-foreground text-xs">- {player.position || 'Sans poste'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlayerId && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-primary flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Affichage des données pour <span className="font-bold">{players.find(p => p.id === selectedPlayerId)?.first_name} {players.find(p => p.id === selectedPlayerId)?.last_name}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KPI Cards avec animations améliorées */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {kpiData.map((kpi, index) => (
                <Card 
                  key={kpi.title} 
                  className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm bg-white/80 group cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInUp 0.5s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <div className={`h-2 w-full bg-gradient-to-r ${kpi.bgGradient} group-hover:h-3 transition-all relative overflow-hidden`}>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <div className="absolute top-0 right-0 text-6xl opacity-20">{kpi.emoji}</div>
                    </div>
                    <CardTitle className="text-sm font-medium text-muted-foreground relative z-10">{kpi.title}</CardTitle>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.bgGradient} text-white text-3xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10`}>
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {kpi.emoji}
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-4xl font-bold group-hover:scale-110 transition-transform bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{kpi.value}</div>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className={`h-4 w-4 ${kpi.alert ? 'text-red-500' : 'text-green-500'} group-hover:animate-bounce`} />
                      <p className={`text-sm font-medium ${kpi.alert ? 'text-red-500' : 'text-green-600'}`}>{kpi.trend}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alerte visites programmées aujourd'hui */}
            <TodayVisitsAlert />

            {/* Actions rapides */}
            <QuickActions />

            {/* Notifications */}
            <NotificationsPanel />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Status Distribution with emojis */}
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">🏥</div>
                    <div>
                      <CardTitle>Répartition des états d'aptitude</CardTitle>
                      <CardDescription>État de santé de l&apos;effectif</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {statusDistribution.map((item) => (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.emoji}</span>
                          <StatusBadge status={item.status} />
                        </div>
                        <span className={`font-bold ${item.color}`}>
                          {item.count} joueurs ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.status === 'APTE'
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : item.status === 'APTE_RESTRICTIONS'
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                : item.status === 'TEMP_INAPTE'
                                  ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                  : 'bg-gradient-to-r from-red-400 to-red-600'
                          } shadow-md`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Visits with modern design */}
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">🕐</div>
                    <div>
                      <CardTitle>Visites récentes</CardTitle>
                      <CardDescription>Dernières consultations effectuées</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {recentVisits.length > 0 ? (
                      recentVisits.map((visit) => (
                        <div
                          key={visit.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-slate-50 p-3 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-destructive text-white font-bold">
                              {visit.player?.first_name?.[0]}{visit.player?.last_name?.[0]}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold leading-none">
                                {visit.player?.first_name} {visit.player?.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {visit.module}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {new Date(visit.visit_date).toLocaleDateString('fr-FR')}
                            </span>
                            {visit.fitness_status && <StatusBadge status={visit.fitness_status} />}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-sm text-muted-foreground">Aucune visite récente</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link to="/visits" className="text-sm font-medium text-primary hover:text-destructive flex items-center gap-1 hover:gap-2 transition-all">
                      Voir toutes les visites
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Événements à venir */}
              <UpcomingEvents />
              
              {/* Section Professionnelle Médicale Wydad */}
              <Card className="shadow-xl border-none backdrop-blur-sm bg-gradient-to-br from-primary/10 via-white to-destructive/10 overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-primary via-destructive to-primary"></div>
                <CardHeader className="relative">
                  <div className="absolute top-0 right-0 text-8xl opacity-10">⚕️</div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-destructive text-white text-2xl shadow-lg">
                      🩺
                    </div>
                    <div>
                      <CardTitle>Espace Professionnel Médical</CardTitle>
                      <CardDescription>Ressources et outils pour le médecin du sport</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { 
                        emoji: '🏥', 
                        label: 'Examens PCMA', 
                        count: stats?.medicalStats?.examinations || 0, 
                        color: 'from-primary to-destructive',
                        tooltip: 'Examens médicaux PCMA effectués'
                      },
                      { 
                        emoji: '💉', 
                        label: 'Certificats valides', 
                        count: stats?.medicalStats?.vaccinations || 0, 
                        color: 'from-destructive to-primary',
                        tooltip: 'Certificats médicaux en cours de validité'
                      },
                      { 
                        emoji: '🔬', 
                        label: 'Analyses', 
                        count: stats?.medicalStats?.analyses || 0, 
                        color: 'from-primary to-destructive',
                        tooltip: 'Impédancemétrie et GPS'
                      },
                      { 
                        emoji: '📋', 
                        label: 'À renouveler', 
                        count: stats?.medicalStats?.certificatesToRenew || 0, 
                        color: 'from-destructive to-primary',
                        tooltip: 'Certificats à renouveler sous 30 jours'
                      }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white text-3xl shadow-md group-hover:shadow-xl group-hover:rotate-12 transition-all mb-2`}>
                          {item.emoji}
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{item.count}</span>
                        <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Statistiques supplémentaires */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🤕</span>
                        <span className="text-xs text-slate-600 font-medium">Blessures</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900">{stats?.medicalStats?.activeInjuries || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🥗</span>
                        <span className="text-xs text-slate-600 font-medium">Nutrition</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900">{stats?.medicalStats?.nutritionConsultations || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">💆</span>
                        <span className="text-xs text-slate-600 font-medium">Soins</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900">{stats?.medicalStats?.careSessions || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">👥</span>
                        <span className="text-xs text-slate-600 font-medium">Patients</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900">{stats?.medicalStats?.totalPatients || 0}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-destructive/10 border-2 border-primary/30">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-destructive to-primary text-white text-xl flex-shrink-0">
                        💡
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Conseil du jour</h4>
                        <p className="text-sm text-slate-600">
                          {stats?.medicalStats?.certificatesToRenew > 0 
                            ? `⚠️ Attention : ${stats.medicalStats.certificatesToRenew} certificat(s) à renouveler dans les 30 jours !`
                            : stats?.medicalStats?.activeInjuries > 0
                              ? `📊 Vous suivez actuellement ${stats.medicalStats.activeInjuries} blessure(s). Pensez à mettre à jour leur état.`
                              : '✅ Tous les certificats sont à jour ! Continuez votre excellent travail.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visits Trend Chart with modern styling */}
              <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">📊</div>
                    <div>
                      <CardTitle>Tendance des visites</CardTitle>
                      <CardDescription>Évolution des consultations sur 6 mois</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={visitsData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC143C" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#DC143C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#DC143C" 
                        strokeWidth={3}
                        dot={{ fill: '#DC143C', r: 6 }}
                        activeDot={{ r: 8, fill: '#B71C1C' }} 
                        fill="url(#colorCount)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
