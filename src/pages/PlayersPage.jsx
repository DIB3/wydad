import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/StatusBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Filter, Eye, Users, TrendingUp, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { CreatePlayerDialog } from '@/components/CreatePlayerDialog'
import { Badge } from '@/components/ui/badge'

export default function PlayersPage() {
  const { players, loading, refetch } = usePlayers()

  const handlePlayerCreated = () => {
    refetch()
  }

  const totalPlayers = players.length
  const aptePlayers = players.filter(p => p.current_status === 'APTE').length
  const inaptePlayers = players.filter(p => p.current_status === 'INAPTE' || p.current_status === 'TEMP_INAPTE').length

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
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Joueurs 👥
                </h1>
                <p className="text-lg text-muted-foreground">Gestion des dossiers médicaux des joueurs</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="gap-2 shadow-md hover:shadow-lg transition-all">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
                <CreatePlayerDialog onPlayerCreated={handlePlayerCreated} />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total joueurs</p>
                      <p className="text-3xl font-bold mt-2">{totalPlayers}</p>
                      <p className="text-xs text-muted-foreground mt-1">📊 Effectif complet</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-3xl shadow-md">
                      👥
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Joueurs aptes</p>
                      <p className="text-3xl font-bold mt-2 text-green-600">{aptePlayers}</p>
                      <p className="text-xs text-muted-foreground mt-1">✅ Disponibles</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-3xl shadow-md">
                      ✅
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-orange-500 to-red-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Joueurs inaptes</p>
                      <p className="text-3xl font-bold mt-2 text-red-600">{inaptePlayers}</p>
                      <p className="text-xs text-muted-foreground mt-1">⚠️ En soins</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white text-3xl shadow-md">
                      ⚠️
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Players Table Card */}
            <Card className="shadow-lg border-none">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">📋</div>
                  <div>
                    <CardTitle>Liste des joueurs</CardTitle>
                    <CardDescription>Tous les joueurs de l'effectif</CardDescription>
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
                      placeholder="🔍 Rechercher par nom, poste..." 
                      className="pl-9 h-11 shadow-sm"
                    />
                  </div>
                  <Button variant="outline" className="gap-2 h-11 shadow-sm hover:shadow-md transition-all">
                    <Filter className="h-4 w-4" />
                    Filtres
                  </Button>
                </div>

                {/* Players Table */}
                <div className="rounded-lg border shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4 animate-pulse">⚽</div>
                      <p className="text-muted-foreground">Chargement des joueurs...</p>
                    </div>
                  ) : players.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-lg font-medium mb-2">Aucun joueur</p>
                      <p className="text-sm text-muted-foreground">Commencez par ajouter votre premier joueur</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold">👤 Nom</TableHead>
                          <TableHead className="font-semibold">⚽ Poste</TableHead>
                          <TableHead className="font-semibold">🏟️ Club</TableHead>
                          <TableHead className="font-semibold">🎂 Âge</TableHead>
                          <TableHead className="font-semibold">💪 État actuel</TableHead>
                          <TableHead className="font-semibold">📅 Dernière visite</TableHead>
                          <TableHead className="text-right font-semibold">⚙️ Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {players.map((player) => (
                          <TableRow key={player.id} className="hover:bg-blue-50/50 transition-colors">
                            <TableCell className="font-medium">
                              <Link 
                                to={`/players/${player.id}`} 
                                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                                  {player.first_name?.[0]}{player.last_name?.[0]}
                                </div>
                                {player.first_name} {player.last_name}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {player.position ? (
                                <Badge variant="outline" className="font-normal">
                                  {player.position}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>{player.club || '-'}</TableCell>
                            <TableCell>
                              {player.birth_date
                                ? `${new Date().getFullYear() - new Date(player.birth_date).getFullYear()} ans`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {player.current_status ? (
                                <StatusBadge status={player.current_status} />
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">Non défini</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {player.last_visit
                                ? new Date(player.last_visit).toLocaleDateString('fr-FR')
                                : <span className="text-muted-foreground">Aucune visite</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-2 hover:bg-blue-50" 
                                asChild
                              >
                                <Link to={`/players/${player.id}`}>
                                  <Eye className="h-4 w-4" />
                                  Voir
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Footer */}
                {players.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <p>📊 Total: {players.length} joueur{players.length > 1 ? 's' : ''}</p>
                    <p>✅ {aptePlayers} apte{aptePlayers > 1 ? 's' : ''} • ⚠️ {inaptePlayers} inapte{inaptePlayers > 1 ? 's' : ''}</p>
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
