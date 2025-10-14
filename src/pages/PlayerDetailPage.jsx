import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Download, FileText, Plus, TrendingUp, Activity, Heart, Navigation, AlertCircle, Apple, Calendar, Stethoscope, Scale, Target, Flame, Users, FileCheck, Paperclip, History, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { usePlayer } from '../hooks/usePlayers'
import { usePlayerPCMA } from '../hooks/usePCMA'
import { usePlayerImpedance } from '../hooks/useImpedance'
import { usePlayerGPS } from '../hooks/useGPS'
import { usePlayerInjuries } from '../hooks/useInjuries'
import { usePlayerNutrition } from '../hooks/useNutrition'
import { usePlayerCertificates } from '../hooks/usePlayerCertificates'
import { usePlayerAttachments } from '../hooks/usePlayerAttachments'
import { usePlayerAuditLogs } from '../hooks/usePlayerAuditLogs'
import { useEffect, useState } from 'react'
import { useSocket } from '../contexts/SocketContext'
import certificateService from '../services/certificate.service'
import { toast } from 'sonner'
import { CertificateQuickEditDialog } from '../components/CertificateQuickEditDialog'

const imcData = [
  { date: 'Jan', value: 22.5 },
  { date: 'Fév', value: 22.7 },
  { date: 'Mar', value: 22.6 },
  { date: 'Avr', value: 22.8 },
  { date: 'Mai', value: 22.9 },
  { date: 'Juin', value: 22.8 },
]

const taData = [
  { date: 'Jan', systolic: 125, diastolic: 75 },
  { date: 'Fév', systolic: 128, diastolic: 78 },
  { date: 'Mar', systolic: 126, diastolic: 76 },
  { date: 'Avr', systolic: 128, diastolic: 78 },
  { date: 'Mai', systolic: 127, diastolic: 77 },
  { date: 'Juin', systolic: 128, diastolic: 78 },
]

export default function PlayerDetailPage() {
  const { id } = useParams()
  const { player, loading } = usePlayer(id)
  const { pcmaList, loading: pcmaLoading } = usePlayerPCMA(id)
  const { impedanceList, loading: impedanceLoading } = usePlayerImpedance(id)
  const { gpsList, stats: gpsStats, loading: gpsLoading } = usePlayerGPS(id)
  const { injuriesList, stats: injuryStats, loading: injuriesLoading } = usePlayerInjuries(id)
  const { nutritionList, stats: nutritionStats, loading: nutritionLoading } = usePlayerNutrition(id)
  const { certificates, loading: certificatesLoading, refetch: refetchCertificates } = usePlayerCertificates(id)
  const { attachments, loading: attachmentsLoading } = usePlayerAttachments(id)
  const { auditLogs, loading: auditLogsLoading } = usePlayerAuditLogs(id)

  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false)

  // Récupérer le dernier certificat
  const latestCertificate = certificates && certificates.length > 0 
    ? certificates.sort((a, b) => new Date(b.valid_from || b.issue_date) - new Date(a.valid_from || a.issue_date))[0]
    : null

  // Fonction pour télécharger un certificat
  const handleDownloadCertificate = async (certificateId) => {
    try {
      toast.loading('Téléchargement en cours...')
      await certificateService.download(certificateId)
      toast.success('Certificat téléchargé avec succès')
    } catch (error) {
      console.error('Erreur téléchargement certificat:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handleCertificateSuccess = () => {
    refetchCertificates()
    toast.dismiss()
  }

  const { joinPlayerRoom, leavePlayerRoom } = useSocket()

  useEffect(() => {
    if (id) {
      joinPlayerRoom(id)
      return () => leavePlayerRoom(id)
    }
  }, [id, joinPlayerRoom, leavePlayerRoom])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Joueur non trouvé</p>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-6 p-6">
            {/* Back Button */}
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/players">
                <ArrowLeft className="h-4 w-4" />
                Retour aux joueurs
              </Link>
            </Button>

            {/* Player Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-balance">
                  {player.first_name} {player.last_name}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>
                    {player.position} • {player.club}
                  </span>
                  <span>
                    {player.birth_date &&
                      new Date().getFullYear() - new Date(player.birth_date).getFullYear()}{' '}
                    ans • {player.height_cm}cm • {player.weight_kg}kg
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {player.current_status && <StatusBadge status={player.current_status} />}
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle visite
                </Button>
              </div>
            </div>

            {/* État d'Aptitude Card */}
            <Card className="shadow-lg border-none bg-gradient-to-br from-white to-indigo-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">État d'Aptitude Médical</CardTitle>
                      <CardDescription>
                        {latestCertificate 
                          ? `Dernière mise à jour le ${new Date(latestCertificate.valid_from || latestCertificate.issue_date).toLocaleDateString('fr-FR')}`
                          : 'Aucun certificat médical enregistré'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setCertificateDialogOpen(true)}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <FileCheck className="h-4 w-4" />
                    {latestCertificate ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {latestCertificate ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Statut Actuel</p>
                      <StatusBadge status={latestCertificate.status || latestCertificate.fitness_status} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Validité</p>
                      <p className="text-sm font-semibold">
                        {latestCertificate.valid_until || latestCertificate.expiry_date
                          ? `Jusqu'au ${new Date(latestCertificate.valid_until || latestCertificate.expiry_date).toLocaleDateString('fr-FR')}`
                          : 'Indéterminée'
                        }
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Médecin</p>
                      <p className="text-sm font-semibold">{latestCertificate.physician_name || '-'}</p>
                    </div>
                    {(latestCertificate.restrictions) && (
                      <div className="space-y-2 md:col-span-3">
                        <p className="text-sm font-medium text-muted-foreground">Restrictions / Observations</p>
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-sm text-amber-800">{latestCertificate.restrictions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Aucun certificat médical enregistré</p>
                      <Button 
                        onClick={() => setCertificateDialogOpen(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Créer le premier certificat
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificate Dialog */}
            <CertificateQuickEditDialog
              open={certificateDialogOpen}
              onOpenChange={setCertificateDialogOpen}
              playerId={id}
              currentCertificate={latestCertificate}
              onSuccess={handleCertificateSuccess}
            />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="visits">Visites</TabsTrigger>
                <TabsTrigger value="charts">Courbes</TabsTrigger>
                <TabsTrigger value="certificates">Certificats</TabsTrigger>
                <TabsTrigger value="attachments">Pièces jointes</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Informations Complètes du Joueur */}
                <Card className="shadow-xl border-none backdrop-blur-sm bg-gradient-to-br from-white to-slate-50">
                  <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Informations Complètes</CardTitle>
                        <CardDescription className="text-base">Toutes les données du joueur</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {/* Section Identité */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-600 pb-2 border-b-2 border-blue-100">
                          👤 Identité
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Prénom</span>
                            <span className="text-sm font-semibold">{player.first_name || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Nom</span>
                            <span className="text-sm font-semibold">{player.last_name || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Sexe</span>
                            <span className="text-sm font-semibold">{player.sex === 'M' ? '♂️ Masculin' : player.sex === 'F' ? '♀️ Féminin' : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Date de naissance</span>
                            <span className="text-sm font-semibold">
                              {player.birth_date ? new Date(player.birth_date).toLocaleDateString('fr-FR') : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Âge</span>
                            <span className="text-sm font-semibold">
                              {player.birth_date ? `${new Date().getFullYear() - new Date(player.birth_date).getFullYear()} ans` : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Nationalité</span>
                            <span className="text-sm font-semibold">{player.nationality || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Pays</span>
                            <span className="text-sm font-semibold">{player.country || '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section Profil Sportif */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600 pb-2 border-b-2 border-green-100">
                          ⚽ Profil Sportif
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Licence ID</span>
                            <span className="text-sm font-semibold font-mono">{player.licence_id || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Club</span>
                            <span className="text-sm font-semibold">{player.club || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Poste</span>
                            {player.position ? (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                {player.position}
                              </Badge>
                            ) : (
                              <span className="text-sm font-semibold">-</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Pied dominant</span>
                            <span className="text-sm font-semibold">{player.dominant_foot || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Taille</span>
                            <span className="text-sm font-semibold">{player.height_cm ? `${player.height_cm} cm` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Poids</span>
                            <span className="text-sm font-semibold">{player.weight_kg ? `${player.weight_kg} kg` : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">IMC</span>
                            <span className="text-sm font-semibold">
                              {player.height_cm && player.weight_kg 
                                ? `${(player.weight_kg / ((player.height_cm / 100) ** 2)).toFixed(1)} kg/m²`
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section Médical & Statut */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-600 pb-2 border-b-2 border-purple-100">
                          🏥 Médical & Statut
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-purple-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Statut actuel</span>
                            {player.current_status ? (
                              <StatusBadge status={player.current_status} />
                            ) : (
                              <Badge variant="outline">Non défini</Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg hover:bg-purple-50/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Dernière visite</span>
                            <span className="text-sm font-semibold">
                              {player.last_visit ? new Date(player.last_visit).toLocaleDateString('fr-FR') : 'Aucune'}
                            </span>
                          </div>
                          <div className="col-span-full p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
                            <span className="text-sm font-medium text-purple-700 block mb-2">🩺 Allergies</span>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                              {player.allergies || 'Aucune allergie connue'}
                            </p>
                          </div>
                          <div className="col-span-full p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
                            <span className="text-sm font-medium text-blue-700 block mb-2">📝 Notes</span>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                              {player.notes || 'Aucune note'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Modules Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {/* PCMA Stats */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{pcmaList.length}</p>
                          <p className="text-xs text-muted-foreground">Examens PCMA</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Impedance Stats */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          <Scale className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{impedanceList.length}</p>
                          <p className="text-xs text-muted-foreground">Mesures corpo</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GPS Stats */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                          <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{gpsList.length}</p>
                          <p className="text-xs text-muted-foreground">Sessions GPS</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Injuries Stats */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{injuriesList.length}</p>
                          <p className="text-xs text-muted-foreground">Blessures</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nutrition Stats */}
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                          <Apple className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{nutritionList.length}</p>
                          <p className="text-xs text-muted-foreground">Plans nutrition</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Latest PCMA Data */}
                {pcmaList.length > 0 && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Dernières données PCMA</CardTitle>
                          <CardDescription>
                            {new Date(pcmaList[0].visit?.visit_date).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">IMC</span>
                          <span className="text-lg font-semibold">{pcmaList[0].bmi || 'N/A'} kg/m²</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">TA</span>
                          <span className="text-lg font-semibold">{pcmaList[0].bp_sys || 'N/A'}/{pcmaList[0].bp_dia || 'N/A'} mmHg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">FC</span>
                          <span className="text-lg font-semibold">{pcmaList[0].hr_bpm || 'N/A'} bpm</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Aptitude</span>
                          {pcmaList[0].aptitude && <StatusBadge status={pcmaList[0].aptitude} />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Latest Impedance Data */}
                {impedanceList.length > 0 && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Dernière composition corporelle</CardTitle>
                          <CardDescription>
                            {new Date(impedanceList[0].visit?.visit_date).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Poids</span>
                          <span className="text-lg font-semibold">{impedanceList[0].weight_kg || 'N/A'} kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Masse grasse</span>
                          <span className="text-lg font-semibold">{impedanceList[0].body_fat_percent || 'N/A'}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Masse maigre</span>
                          <span className="text-lg font-semibold">{impedanceList[0].lean_mass_kg || 'N/A'} kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Hydratation</span>
                          <span className="text-lg font-semibold">{impedanceList[0].hydration_percent || 'N/A'}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* GPS Performance */}
                {gpsStats && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                          <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Performance GPS</CardTitle>
                          <CardDescription>{gpsStats.totalSessions} sessions enregistrées</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Distance totale</span>
                          <span className="text-lg font-semibold">{(gpsStats.totalDistance / 1000).toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Vitesse max</span>
                          <span className="text-lg font-semibold">{gpsStats.maxSpeed?.toFixed(1)} km/h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Charge moy.</span>
                          <span className="text-lg font-semibold">{gpsStats.avgPlayerLoad?.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Sprints totaux</span>
                          <span className="text-lg font-semibold">{gpsStats.totalSprints}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Injury Stats */}
                {injuryStats && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Suivi des blessures</CardTitle>
                          <CardDescription>{injuryStats.totalInjuries} blessures enregistrées</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Actives</span>
                          <span className="text-lg font-semibold text-red-600">{injuryStats.activeInjuries}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Jours perdus</span>
                          <span className="text-lg font-semibold">{injuryStats.totalDaysLost}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Durée moy.</span>
                          <span className="text-lg font-semibold">{injuryStats.avgInjuryDuration?.toFixed(0)} j</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Nutrition Stats */}
                {nutritionStats && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                          <Apple className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Nutrition</CardTitle>
                          <CardDescription>{nutritionStats.totalPlans} plans enregistrés</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Calories moy.</span>
                          <span className="text-lg font-semibold">{nutritionStats.avgCalories?.toFixed(0)} kcal</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Protéines</span>
                          <span className="text-lg font-semibold">{nutritionStats.avgProtein?.toFixed(0)}g</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Glucides</span>
                          <span className="text-lg font-semibold">{nutritionStats.avgCarbs?.toFixed(0)}g</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Hydratation</span>
                          <span className="text-lg font-semibold">{nutritionStats.avgHydration?.toFixed(1)}L</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Visits Tab */}
              <TabsContent value="visits" className="space-y-6">
                {/* Message si aucune visite */}
                {pcmaList.length === 0 && impedanceList.length === 0 && gpsList.length === 0 && injuriesList.length === 0 && nutritionList.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">Aucune visite enregistrée</p>
                      <p className="text-sm text-muted-foreground mt-2">Les données des visites du joueur apparaîtront ici</p>
                    </CardContent>
                  </Card>
                )}

                {/* PCMA Visits */}
                {pcmaList.length > 0 && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            <Stethoscope className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Examens PCMA</CardTitle>
                            <CardDescription>{pcmaList.length} examens</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {pcmaList.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>IMC</TableHead>
                            <TableHead>TA</TableHead>
                            <TableHead>FC</TableHead>
                            <TableHead>Aptitude</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pcmaList.slice(0, 5).map((pcma, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(pcma.visit?.visit_date).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell>{pcma.bmi || 'N/A'}</TableCell>
                              <TableCell>{pcma.bp_sys}/{pcma.bp_dia}</TableCell>
                              <TableCell>{pcma.hr_bpm || 'N/A'} bpm</TableCell>
                              <TableCell>{pcma.aptitude && <StatusBadge status={pcma.aptitude} />}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Impedance Visits */}
                {impedanceList.length > 0 && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <Scale className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Mesures Impédancemétrie</CardTitle>
                            <CardDescription>{impedanceList.length} mesures</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {impedanceList.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Poids</TableHead>
                            <TableHead>Masse grasse</TableHead>
                            <TableHead>Masse maigre</TableHead>
                            <TableHead>Hydratation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {impedanceList.slice(0, 5).map((imp, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(imp.visit?.visit_date).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell>{imp.weight_kg || 'N/A'} kg</TableCell>
                              <TableCell>{imp.body_fat_percent || 'N/A'}%</TableCell>
                              <TableCell>{imp.lean_mass_kg || 'N/A'} kg</TableCell>
                              <TableCell>{imp.hydration_percent || 'N/A'}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* GPS Visits */}
                {gpsList.length > 0 && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                            <Navigation className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Sessions GPS</CardTitle>
                            <CardDescription>{gpsList.length} sessions</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          {gpsList.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Distance</TableHead>
                            <TableHead>Vmax</TableHead>
                            <TableHead>Charge</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gpsList.slice(0, 5).map((gps, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(gps.visit?.visit_date).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell>{gps.session_type || 'N/A'}</TableCell>
                              <TableCell>{(gps.distance_m / 1000).toFixed(1)} km</TableCell>
                              <TableCell>{gps.vmax_kmh || 'N/A'} km/h</TableCell>
                              <TableCell>{gps.player_load || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Injuries Visits */}
                {injuriesList.length > 0 && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Blessures</CardTitle>
                            <CardDescription>{injuriesList.length} blessures</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                          {injuriesList.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Localisation</TableHead>
                            <TableHead>Gravité</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {injuriesList.slice(0, 5).map((injury, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(injury.injury_date).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell>{injury.type || 'N/A'}</TableCell>
                              <TableCell>{injury.location || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  injury.severity === 'legere' ? 'success' : 
                                  injury.severity === 'moderee' ? 'warning' : 
                                  'destructive'
                                }>
                                  {injury.severity}
                                </Badge>
                              </TableCell>
                              <TableCell>{injury.recovery_status || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Nutrition Visits */}
                {nutritionList.length > 0 && (
                  <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                            <Apple className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Plans Nutrition</CardTitle>
                            <CardDescription>{nutritionList.length} plans</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                          {nutritionList.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Calories</TableHead>
                            <TableHead>Protéines</TableHead>
                            <TableHead>Glucides</TableHead>
                            <TableHead>Hydratation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nutritionList.slice(0, 5).map((nutrition, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(nutrition.visit?.visit_date).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell>{nutrition.kcal_target || 'N/A'} kcal</TableCell>
                              <TableCell>{nutrition.protein_g || 'N/A'}g</TableCell>
                              <TableCell>{nutrition.carbs_g || 'N/A'}g</TableCell>
                              <TableCell>{nutrition.hydration_l || 'N/A'}L</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="charts" className="space-y-6">
                {/* PCMA Charts - Toujours affichés */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Évolutions PCMA
                    {pcmaList.length > 0 && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {pcmaList.length} mesures
                      </Badge>
                    )}
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* IMC Evolution */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Évolution IMC</CardTitle>
                            <CardDescription>
                              {pcmaList.length === 0 ? 'En attente de données' : `${pcmaList.length} mesures`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={pcmaList.length === 0 
                            ? [{ date: 'Début', imc: 0, poids: 0 }] 
                            : pcmaList.map((pcma, idx) => ({
                                date: new Date(pcma.visit?.visit_date).toLocaleDateString('fr-FR', { month: 'short' }),
                                imc: pcma.bmi,
                                poids: pcma.weight_kg
                              })).reverse()
                          }>
                              <defs>
                                <linearGradient id="imcGradientPlayer" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="date" className="text-xs" stroke="#64748b" />
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
                                dataKey="imc"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#imcGradientPlayer)"
                                dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                    {/* Blood Pressure Evolution */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-red-500 to-pink-500" />
                      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
                            <Heart className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Tension artérielle</CardTitle>
                            <CardDescription>
                              {pcmaList.length === 0 ? 'En attente de données' : 'Historique TA'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={pcmaList.length === 0 
                            ? [{ date: 'Début', systolique: 0, diastolique: 0 }] 
                            : pcmaList.map((pcma) => ({
                                date: new Date(pcma.visit?.visit_date).toLocaleDateString('fr-FR', { month: 'short' }),
                                systolique: pcma.bp_sys,
                                diastolique: pcma.bp_dia
                              })).reverse()
                          }>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="date" className="text-xs" stroke="#64748b" />
                              <YAxis domain={[60, 150]} className="text-xs" stroke="#64748b" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  borderRadius: '12px',
                                  border: '2px solid #ef4444',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Line type="monotone" dataKey="systolique" stroke="#ef4444" strokeWidth={3} name="Systolique" />
                              <Line type="monotone" dataKey="diastolique" stroke="#ec4899" strokeWidth={3} name="Diastolique" />
                              <Legend />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                  </div>
                </div>

                {/* Impedance Charts - Toujours affichés */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Évolutions Impédancemétrie
                    {impedanceList.length > 0 && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {impedanceList.length} mesures
                      </Badge>
                    )}
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Weight Evolution */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Évolution du poids</CardTitle>
                            <CardDescription>
                              {impedanceList.length === 0 ? 'En attente de données' : `${impedanceList.length} mesures`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={impedanceList.length === 0 
                            ? [{ date: 'Début', poids: 0, masseMaigre: 0 }] 
                            : impedanceList.map((imp) => ({
                                date: new Date(imp.visit?.visit_date).toLocaleDateString('fr-FR', { month: 'short' }),
                                poids: imp.weight_kg,
                                masseMaigre: imp.lean_mass_kg
                              })).reverse()
                          }>
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
                              <Line type="monotone" dataKey="poids" stroke="#a855f7" strokeWidth={3} name="Poids" />
                              <Line type="monotone" dataKey="masseMaigre" stroke="#ec4899" strokeWidth={2} name="Masse maigre" strokeDasharray="5 5" />
                              <Legend />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                    {/* Body Composition */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
                      <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Composition corporelle</CardTitle>
                            <CardDescription>
                              {impedanceList.length === 0 ? 'En attente de données' : 'Dernière mesure'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={impedanceList.length === 0 
                            ? [{ name: 'Actuel', masseGrasse: 0, masseMaigre: 0 }] 
                            : [{
                                name: 'Actuel',
                                masseGrasse: impedanceList[0].body_fat_percent,
                                masseMaigre: 100 - (impedanceList[0].body_fat_percent || 0)
                              }]
                          }>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="name" className="text-xs" stroke="#64748b" />
                              <YAxis className="text-xs" stroke="#64748b" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  borderRadius: '12px',
                                  border: '2px solid #ec4899',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Bar dataKey="masseGrasse" fill="#ec4899" radius={[8, 8, 0, 0]} name="Masse grasse %" />
                              <Bar dataKey="masseMaigre" fill="#a855f7" radius={[8, 8, 0, 0]} name="Masse maigre %" />
                              <Legend />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                  </div>
                </div>

                {/* GPS Charts - Toujours affichés */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Évolutions GPS
                    {gpsList.length > 0 && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        {gpsList.length} sessions
                      </Badge>
                    )}
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Distance Evolution */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Évolution des distances</CardTitle>
                            <CardDescription>
                              {gpsList.length === 0 ? 'En attente de données' : `${gpsList.length} sessions`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={gpsList.length === 0 
                            ? [{ session: 'S1', distance: 0, hid: 0 }] 
                            : gpsList.map((gps, idx) => ({
                                session: `S${idx + 1}`,
                                distance: (gps.distance_m / 1000).toFixed(1),
                                hid: (gps.hid_m / 1000).toFixed(1)
                              })).reverse()
                          }>
                              <defs>
                                <linearGradient id="distanceGradientPlayer" x1="0" y1="0" x2="0" y2="1">
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
                              <Area type="monotone" dataKey="distance" stroke="#10b981" strokeWidth={3} fill="url(#distanceGradientPlayer)" name="Distance (km)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                    {/* Speed Evolution */}
                    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Vitesses</CardTitle>
                            <CardDescription>
                              {gpsList.length === 0 ? 'En attente de données' : 'Max et moyenne'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={gpsList.length === 0 
                            ? [{ session: 'S1', vmax: 0, vmoy: 0 }] 
                            : gpsList.map((gps, idx) => ({
                                session: `S${idx + 1}`,
                                vmax: gps.vmax_kmh,
                                vmoy: gps.avg_speed_kmh
                              })).reverse()
                          }>
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
                              <Line type="monotone" dataKey="vmax" stroke="#06b6d4" strokeWidth={3} name="Vmax (km/h)" />
                              <Line type="monotone" dataKey="vmoy" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Vmoy (km/h)" />
                              <Legend />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                  </div>
                </div>

                {/* Injuries Charts - Affichés si des données existent */}
                {injuriesList.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Analyse des blessures
                      <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                        {injuriesList.length} blessures
                      </Badge>
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Injury Types Distribution */}
                      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                              <Target className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Types de blessures</CardTitle>
                              <CardDescription>Répartition</CardDescription>
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
                                {[
                                  { color: '#ef4444' },
                                  { color: '#f97316' },
                                  { color: '#f59e0b' },
                                  { color: '#eab308' },
                                  { color: '#84cc16' }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Severity Distribution */}
                      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Gravité des blessures</CardTitle>
                              <CardDescription>Répartition</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={(() => {
                              const severityCount = { legere: 0, moderee: 0, severe: 0 }
                              injuriesList.forEach(injury => {
                                if (injury.severity) {
                                  severityCount[injury.severity]++
                                }
                              })
                              return [
                                { name: 'Légère', count: severityCount.legere },
                                { name: 'Modérée', count: severityCount.moderee },
                                { name: 'Sévère', count: severityCount.severe }
                              ]
                            })()}>
                              <defs>
                                <linearGradient id="severityGradientPlayer" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#eab308" stopOpacity={0.9}/>
                                </linearGradient>
                              </defs>
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
                              <Bar dataKey="count" fill="url(#severityGradientPlayer)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Nutrition Charts */}
                {nutritionList.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Apple className="h-5 w-5" />
                      Évolutions Nutrition
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Calorie Evolution */}
                      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-500" />
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                              <Flame className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Apport calorique</CardTitle>
                              <CardDescription>Évolution</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={nutritionList.map((nutrition, idx) => ({
                              date: new Date(nutrition.visit?.visit_date).toLocaleDateString('fr-FR', { month: 'short' }),
                              calories: nutrition.kcal_target
                            })).reverse()}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                              <XAxis dataKey="date" className="text-xs" stroke="#64748b" />
                              <YAxis className="text-xs" stroke="#64748b" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  borderRadius: '12px',
                                  border: '2px solid #f97316',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} name="Calories (kcal)" />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Macronutrients Latest */}
                      <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80 overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-500" />
                        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
                              <Activity className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Macronutriments</CardTitle>
                              <CardDescription>Dernier plan</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Protéines', value: nutritionList[0].protein_g || 0, color: '#ef4444' },
                                  { name: 'Glucides', value: nutritionList[0].carbs_g || 0, color: '#3b82f6' },
                                  { name: 'Lipides', value: nutritionList[0].fat_g || 0, color: '#f59e0b' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}g`}
                                outerRadius={80}
                                dataKey="value"
                              >
                                {[
                                  { color: '#ef4444' },
                                  { color: '#3b82f6' },
                                  { color: '#f59e0b' }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="certificates">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle>Certificats médicaux</CardTitle>
                          <CardDescription>{certificates.length} certificat(s)</CardDescription>
                        </div>
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nouveau certificat
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {certificatesLoading ? (
                      <p className="text-center text-muted-foreground py-8">Chargement...</p>
                    ) : certificates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucun certificat pour le moment.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Date d'émission</TableHead>
                            <TableHead>Date d'expiration</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Fichier</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {certificates.map((cert) => (
                            <TableRow key={cert.id}>
                              <TableCell className="font-medium">{cert.type || 'Certificat médical'}</TableCell>
                              <TableCell>
                                {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell>
                                {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell>
                                {cert.expiry_date && new Date(cert.expiry_date) < new Date() ? (
                                  <Badge variant="destructive">Expiré</Badge>
                                ) : (
                                  <Badge variant="success" className="bg-green-500">Valide</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {cert.pdf_attachment_id && (
                                  <Badge variant="outline" className="gap-1">
                                    <FileText className="h-3 w-3" />
                                    PDF
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="gap-2"
                                  onClick={() => handleDownloadCertificate(cert.id)}
                                >
                                  <Download className="h-4 w-4" />
                                  Télécharger
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Paperclip className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle>Pièces jointes</CardTitle>
                          <CardDescription>{attachments.length} fichier(s)</CardDescription>
                        </div>
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter un fichier
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {attachmentsLoading ? (
                      <p className="text-center text-muted-foreground py-8">Chargement...</p>
                    ) : attachments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucune pièce jointe pour le moment.</p>
                    ) : (
                      <div className="grid gap-3">
                        {attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-slate-100">
                                <FileText className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-medium">{attachment.original_filename || 'Fichier'}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{attachment.category || 'General'}</span>
                                  {attachment.file_size && (
                                    <>
                                      <span>•</span>
                                      <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                                    </>
                                  )}
                                  {attachment.uploaded_at && (
                                    <>
                                      <span>•</span>
                                      <span>{new Date(attachment.uploaded_at).toLocaleDateString('fr-FR')}</span>
                                    </>
                                  )}
                                </div>
                                {attachment.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{attachment.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Voir
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Download className="h-4 w-4" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <History className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle>Journal d'audit</CardTitle>
                        <CardDescription>Historique des modifications - {auditLogs.length} entrée(s)</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {auditLogsLoading ? (
                      <p className="text-center text-muted-foreground py-8">Chargement...</p>
                    ) : auditLogs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucun historique pour le moment.</p>
                    ) : (
                      <div className="space-y-4">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="p-2 rounded-lg bg-slate-100 mt-1">
                              {log.action === 'CREATE' && <Plus className="h-4 w-4 text-green-600" />}
                              {log.action === 'UPDATE' && <FileText className="h-4 w-4 text-blue-600" />}
                              {log.action === 'DELETE' && <AlertCircle className="h-4 w-4 text-red-600" />}
                              {!['CREATE', 'UPDATE', 'DELETE'].includes(log.action) && <History className="h-4 w-4 text-slate-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {log.action === 'CREATE' && 'Création'}
                                    {log.action === 'UPDATE' && 'Modification'}
                                    {log.action === 'DELETE' && 'Suppression'}
                                    {!['CREATE', 'UPDATE', 'DELETE'].includes(log.action) && log.action}
                                    {' '}
                                    {log.module && `- ${log.module}`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {log.occurred_at && new Date(log.occurred_at).toLocaleString('fr-FR')}
                                    {log.actor_id && ` • Par utilisateur ${log.actor_id}`}
                                  </p>
                                </div>
                                <Badge variant="outline" className={
                                  log.action === 'CREATE' ? 'bg-green-50' :
                                  log.action === 'UPDATE' ? 'bg-blue-50' :
                                  log.action === 'DELETE' ? 'bg-red-50' :
                                  ''
                                }>
                                  {log.action}
                                </Badge>
                              </div>
                              {log.changes && (
                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono">
                                  {typeof log.changes === 'string' ? log.changes : JSON.stringify(log.changes, null, 2)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

