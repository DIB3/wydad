import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/StatusBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Filter, FileText, AlertCircle, Eye, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCertificates } from '../hooks/useCertificates'
import certificateService from '../services/certificate.service'
import { toast } from 'sonner'

export default function CertificatesPage() {
  const { certificates, loading } = useCertificates()
  const [searchTerm, setSearchTerm] = useState('')

  const calculateDaysRemaining = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleDownload = async (certificateId, playerName) => {
    try {
      toast.loading('Téléchargement en cours...')
      await certificateService.download(certificateId)
      toast.success(`Certificat de ${playerName} téléchargé`)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handleExportAll = () => {
    toast.info('Fonctionnalité d\'exportation en développement', {
      description: 'L\'exportation de tous les certificats sera bientôt disponible'
    })
  }

  // Filtrer les certificats par recherche
  const filteredCertificates = certificates.filter((cert) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const playerName = `${cert.player?.first_name || ''} ${cert.player?.last_name || ''}`.toLowerCase()
    const physicianName = cert.physician_name?.toLowerCase() || ''
    return playerName.includes(searchLower) || physicianName.includes(searchLower)
  })

  const validCertificates = filteredCertificates.filter((c) => calculateDaysRemaining(c.expiry_date) > 0).length
  const expiringSoon = filteredCertificates.filter(
    (c) => calculateDaysRemaining(c.expiry_date) > 0 && calculateDaysRemaining(c.expiry_date) <= 30
  ).length
  const expiredCertificates = filteredCertificates.filter((c) => calculateDaysRemaining(c.expiry_date) < 0).length
  const withRestrictions = filteredCertificates.filter((c) => c.fitness_status === 'APTE_RESTRICTIONS').length

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
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Certificats Médicaux 📄
                </h1>
                <p className="text-lg text-muted-foreground">Gestion et suivi des certificats d'aptitude</p>
              </div>
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                onClick={handleExportAll}
              >
                <Download className="h-5 w-5" />
                Exporter tout
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Certificats valides</p>
                      <p className="text-3xl font-bold mt-2 text-green-600">{validCertificates}</p>
                      <p className="text-xs text-muted-foreground mt-1">✅ En cours de validité</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-3xl shadow-md">
                      ✅
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Expire bientôt</p>
                      <p className="text-3xl font-bold mt-2 text-orange-600">{expiringSoon}</p>
                      <p className="text-xs text-muted-foreground mt-1">⏰ Dans les 30 jours</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-3xl shadow-md">
                      ⏰
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-red-500 to-pink-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Expirés</p>
                      <p className="text-3xl font-bold mt-2 text-red-600">{expiredCertificates}</p>
                      <p className="text-xs text-muted-foreground mt-1">❌ À renouveler</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white text-3xl shadow-md">
                      ❌
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avec restrictions</p>
                      <p className="text-3xl font-bold mt-2 text-blue-600">{withRestrictions}</p>
                      <p className="text-xs text-muted-foreground mt-1">⚠️ Aptitude conditionnelle</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-3xl shadow-md">
                      ⚠️
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certificates Table Card */}
            <Card className="shadow-lg border-none">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">📋</div>
                  <div>
                    <CardTitle>Liste des certificats</CardTitle>
                    <CardDescription>Tous les certificats d'aptitude émis</CardDescription>
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
                      placeholder="🔍 Rechercher par joueur ou médecin..." 
                      className="pl-9 h-11 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {searchTerm && (
                    <Badge variant="secondary" className="h-11 px-4">
                      {filteredCertificates.length} résultat{filteredCertificates.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Certificates Table */}
                <div className="rounded-lg border shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4 animate-pulse">📄</div>
                      <p className="text-muted-foreground">Chargement des certificats...</p>
                    </div>
                  ) : filteredCertificates.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-lg font-medium mb-2">
                        {searchTerm ? 'Aucun résultat' : 'Aucun certificat'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Essayez une autre recherche' : 'Les certificats apparaîtront ici une fois émis'}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold">👤 Joueur</TableHead>
                          <TableHead className="font-semibold">💪 Statut</TableHead>
                          <TableHead className="font-semibold">📅 Émission</TableHead>
                          <TableHead className="font-semibold">⏳ Expiration</TableHead>
                          <TableHead className="font-semibold">🕐 Validité</TableHead>
                          <TableHead className="font-semibold">👨‍⚕️ Médecin</TableHead>
                          <TableHead className="text-right font-semibold">⚙️ Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCertificates.map((cert) => {
                          const daysRemaining = calculateDaysRemaining(cert.expiry_date)
                          return (
                            <TableRow key={cert.id} className="hover:bg-indigo-50/50 transition-colors">
                              <TableCell className="font-medium">
                                <Link 
                                  to={`/certificates/${cert.id}`} 
                                  className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold">
                                    {cert.player?.first_name?.[0]}{cert.player?.last_name?.[0]}
                                  </div>
                                  {cert.player?.first_name} {cert.player?.last_name}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={cert.fitness_status} />
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(cert.issue_date).toLocaleDateString('fr-FR')}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(cert.expiry_date).toLocaleDateString('fr-FR')}
                              </TableCell>
                              <TableCell>
                                {daysRemaining < 0 ? (
                                  <Badge className="gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white border-none">
                                    ❌ Expiré
                                  </Badge>
                                ) : daysRemaining <= 30 ? (
                                  <Badge className="gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                                    ⏰ {daysRemaining} jours
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="gap-1">
                                    ✅ {daysRemaining} jours
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {cert.creator?.first_name} {cert.creator?.last_name}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-indigo-50" asChild>
                                    <Link to={`/certificates/${cert.id}`}>
                                      <Eye className="h-4 w-4" />
                                      Voir
                                    </Link>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="gap-2 hover:bg-green-50 hover:text-green-600"
                                    onClick={() => handleDownload(cert.id, `${cert.player?.first_name} ${cert.player?.last_name}`)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Footer */}
                {filteredCertificates.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <p>📊 Total: {filteredCertificates.length} certificat{filteredCertificates.length > 1 ? 's' : ''}
                      {searchTerm && certificates.length !== filteredCertificates.length && 
                        ` (sur ${certificates.length})`
                      }
                    </p>
                    <div className="flex gap-4">
                      <p>✅ {validCertificates} valide{validCertificates > 1 ? 's' : ''}</p>
                      <p>⏰ {expiringSoon} expire{expiringSoon > 1 ? 'nt' : ''} bientôt</p>
                      <p>❌ {expiredCertificates} expiré{expiredCertificates > 1 ? 's' : ''}</p>
                    </div>
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
