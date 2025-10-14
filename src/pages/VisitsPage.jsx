import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/StatusBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Download, FileText, Activity, Clock, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useVisits } from '../hooks/useVisits'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState } from 'react'

export default function VisitsPage() {
  const { visits, loading } = useVisits()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Mapping des modules vers leurs routes
  const moduleRoutes = {
    pcma: '/modules/pcma',
    gps: '/modules/gps',
    impedance: '/modules/impedance',
    injury: '/modules/injuries',
    nutrition: '/modules/nutrition',
    care: '/modules/care',
    examen_medical: '/modules/examen_medical',
    soins: '/modules/soins',
  }
  
  // Fonction pour ouvrir une visite
  const handleOpenVisit = (visit) => {
    const route = moduleRoutes[visit.module]
    if (!route) {
      console.error('Route non trouvée pour le module:', visit.module)
      return
    }
    
    navigate(route, {
      state: {
        visitId: visit.id,
        playerId: visit.player_id
      }
    })
  }

  // Fonction pour déterminer le type de visite
  const getVisitType = (visitDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const visit = new Date(visitDate)
    visit.setHours(0, 0, 0, 0)
    
    if (visit.getTime() === today.getTime()) return 'today'
    if (visit > today) return 'scheduled'
    return 'past'
  }

  // Fonction pour exporter les visites
  const handleExportVisits = () => {
    try {
      // Préparer les données CSV
      const csvHeaders = ['Date', 'Joueur', 'Module', 'Statut', 'Créé par']
      const csvRows = sortedVisits.map(visit => [
        new Date(visit.visit_date).toLocaleDateString('fr-FR'),
        `${visit.player?.first_name || ''} ${visit.player?.last_name || ''}`.trim(),
        visit.module?.toUpperCase() || '',
        getVisitType(visit.visit_date) === 'scheduled' ? 'Programmée' : 'Effectuée',
        `${visit.creator?.first_name || ''} ${visit.creator?.last_name || ''}`.trim()
      ])
      
      // Créer le contenu CSV
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      // Créer et télécharger le fichier
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `visites_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Export réussi !', {
        description: `${sortedVisits.length} visite${sortedVisits.length > 1 ? 's' : ''} exportée${sortedVisits.length > 1 ? 's' : ''} en CSV`
      })
    } catch (error) {
      console.error('Erreur export:', error)
      toast.error('Erreur lors de l\'export')
    }
  }

  // Filtrer les visites par recherche
  const filteredVisits = visits.filter(visit => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const playerName = `${visit.player?.first_name || ''} ${visit.player?.last_name || ''}`.toLowerCase()
    const module = visit.module?.toLowerCase() || ''
    const creatorName = `${visit.creator?.first_name || ''} ${visit.creator?.last_name || ''}`.toLowerCase()
    return playerName.includes(searchLower) || module.includes(searchLower) || creatorName.includes(searchLower)
  })

  // Trier les visites : futures d'abord, puis aujourd'hui, puis passées
  const sortedVisits = [...filteredVisits].sort((a, b) => {
    const dateA = new Date(a.visit_date)
    const dateB = new Date(b.visit_date)
    return dateB - dateA // Plus récent en premier
  })

  const totalVisits = filteredVisits.length
  const scheduledVisits = filteredVisits.filter(v => getVisitType(v.visit_date) === 'scheduled').length
  const thisMonth = filteredVisits.filter(v => {
    const visitDate = new Date(v.visit_date)
    const now = new Date()
    return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear()
  }).length

  const moduleEmojis = {
    pcma: '🏥',
    gps: '📍',
    impedance: '⚡',
    injury: '🩹',
    nutrition: '🥗',
    care: '💆',
    examen_medical: '❤️',
    soins: '🩹'
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-6 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Visites Médicales 📋
                </h1>
                <p className="text-lg text-muted-foreground">Historique de toutes les consultations</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2 shadow-md hover:shadow-lg transition-all"
                  onClick={handleExportVisits}
                  disabled={sortedVisits.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg" asChild>
                  <Link to="/visits/new">
                    <Plus className="h-5 w-5" />
                    Nouvelle visite
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total visites</p>
                      <p className="text-3xl font-bold mt-2">{totalVisits}</p>
                      <p className="text-xs text-muted-foreground mt-1">📊 Consultations enregistrées</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-3xl shadow-md">
                      📋
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Visites programmées</p>
                      <p className="text-3xl font-bold mt-2 text-purple-600">{scheduledVisits}</p>
                      <p className="text-xs text-muted-foreground mt-1">⏰ Visites à venir</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl shadow-md">
                      ⏰
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ce mois-ci</p>
                      <p className="text-3xl font-bold mt-2 text-blue-600">{thisMonth}</p>
                      <p className="text-xs text-muted-foreground mt-1">📅 Visites récentes</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-3xl shadow-md">
                      📅
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visits Table Card */}
            <Card className="shadow-lg border-none">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🗂️</div>
                  <div>
                    <CardTitle>Historique des visites</CardTitle>
                    <CardDescription>Toutes les consultations médicales</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filters */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="🔍 Rechercher par joueur, module, médecin..." 
                      className="pl-9 h-11 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {searchTerm && (
                    <Badge variant="secondary" className="h-11 px-4">
                      {sortedVisits.length} résultat{sortedVisits.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Visits Table */}
                <div className="rounded-lg border shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4 animate-pulse">📋</div>
                      <p className="text-muted-foreground">Chargement des visites...</p>
                    </div>
                  ) : visits.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-lg font-medium mb-2">Aucune visite</p>
                      <p className="text-sm text-muted-foreground mb-4">Commencez par créer votre première consultation</p>
                      <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600" asChild>
                        <Link to="/visits/new">
                          <Plus className="h-4 w-4" />
                          Nouvelle visite
                        </Link>
                      </Button>
                    </div>
                  ) : sortedVisits.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-lg font-medium mb-2">Aucun résultat</p>
                      <p className="text-sm text-muted-foreground">Essayez une autre recherche</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold">📅 Date</TableHead>
                          <TableHead className="font-semibold">👤 Joueur</TableHead>
                          <TableHead className="font-semibold">🏥 Module</TableHead>
                          <TableHead className="font-semibold">👨‍⚕️ Médecin</TableHead>
                          <TableHead className="font-semibold">💪 Statut</TableHead>
                          <TableHead className="text-right font-semibold">⚙️ Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedVisits.map((visit) => {
                          const visitType = getVisitType(visit.visit_date)
                          const isScheduled = visitType === 'scheduled'
                          const isToday = visitType === 'today'
                          
                          return (
                          <TableRow 
                            key={visit.id} 
                            className={cn(
                              "hover:bg-emerald-50/50 transition-colors",
                              isScheduled && "bg-purple-50/30 hover:bg-purple-50/50",
                              isToday && "bg-blue-50/30 hover:bg-blue-50/50"
                            )}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {isScheduled && <Clock className="h-4 w-4 text-purple-600 animate-pulse" />}
                                {isToday && <Activity className="h-4 w-4 text-blue-600" />}
                                {!isScheduled && !isToday && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                <div className="flex flex-col">
                                  <span className={cn(
                                    isScheduled && "text-purple-700 font-semibold",
                                    isToday && "text-blue-700 font-semibold"
                                  )}>
                                    {new Date(visit.visit_date).toLocaleDateString('fr-FR', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </span>
                                  {isScheduled && (
                                    <span className="text-xs text-purple-600 font-medium">⏰ Programmé</span>
                                  )}
                                  {isToday && (
                                    <span className="text-xs text-blue-600 font-medium">📍 Aujourd&apos;hui</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold">
                                  {visit.player?.first_name?.[0]}{visit.player?.last_name?.[0]}
                                </div>
                                <span className="font-medium">
                                  {visit.player?.first_name} {visit.player?.last_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1 font-normal">
                                {moduleEmojis[visit.module] || '📊'}
                                {visit.module}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {visit.creator?.first_name} {visit.creator?.last_name}
                            </TableCell>
                            <TableCell>
                              {isScheduled ? (
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300">
                                  ⏰ À remplir
                                </Badge>
                              ) : visit.fitness_status ? (
                                <StatusBadge status={visit.fitness_status} />
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">Non défini</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isScheduled ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                                  disabled
                                >
                                  <Clock className="h-4 w-4" />
                                  En attente
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="gap-2 hover:bg-emerald-50"
                                  onClick={() => handleOpenVisit(visit)}
                                >
                                  <FileText className="h-4 w-4" />
                                  Ouvrir
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )})}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Footer */}
                {sortedVisits.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <p>📊 Total: {sortedVisits.length} visite{sortedVisits.length > 1 ? 's' : ''}
                        {searchTerm && visits.length !== sortedVisits.length && 
                          ` (sur ${visits.length})`
                        }
                      </p>
                      <div className="flex gap-4">
                        <p>📅 Ce mois-ci: {thisMonth}</p>
                        {scheduledVisits > 0 && (
                          <p>⏰ Programmées: {scheduledVisits}</p>
                        )}
                      </div>
                    </div>
                    {scheduledVisits > 0 && !searchTerm && (
                      <div className="flex items-center gap-2 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <p className="text-sm font-medium text-purple-900">
                          {scheduledVisits} visite{scheduledVisits > 1 ? 's' : ''} programmée{scheduledVisits > 1 ? 's' : ''} à venir
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
