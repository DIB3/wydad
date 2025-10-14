import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Printer, Mail } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '@/components/StatusBadge'
import certificateService from '../services/certificate.service'
import { toast } from 'sonner'

export default function CertificateDetailPage() {
  const { id } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true)
        const data = await certificateService.getById(id)
        setCertificate(data)
      } catch (error) {
        console.error('Erreur chargement certificat:', error)
        toast.error('Erreur lors du chargement du certificat')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCertificate()
    }
  }, [id])

  const handleDownload = async () => {
    try {
      toast.loading('Téléchargement en cours...')
      await certificateService.download(id)
      toast.success('Certificat téléchargé')
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = () => {
    toast.info('Fonctionnalité d\'envoi par email en développement')
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">📄</div>
                <p className="text-muted-foreground">Chargement du certificat...</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (!certificate) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-lg font-medium mb-2">Certificat introuvable</p>
                <Button asChild className="mt-4">
                  <Link to="/certificates">Retour aux certificats</Link>
                </Button>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-6 p-6">
            {/* Back Button */}
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/certificates">
                <ArrowLeft className="h-4 w-4" />
                Retour aux certificats
              </Link>
            </Button>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Certificat médical 📄
              </h1>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleEmail}>
                  <Mail className="h-4 w-4" />
                  Envoyer
                </Button>
                <Button variant="outline" className="gap-2" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
                <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="mx-auto max-w-4xl">
              <Card className="shadow-lg border-none print:shadow-none">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white print:bg-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Certificat médical d'aptitude</CardTitle>
                    <StatusBadge status={certificate.fitness_status} />
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Informations du joueur */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">👤</span>
                      Informations du joueur
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-8">
                      <div>
                        <p className="text-sm text-muted-foreground">Nom complet</p>
                        <p className="font-medium">{certificate.player?.first_name} {certificate.player?.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="font-medium">{certificate.player?.position || 'Non spécifiée'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">💪</span>
                      Statut d'aptitude
                    </h3>
                    <div className="pl-8 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Statut</p>
                        <div className="mt-2">
                          <StatusBadge status={certificate.fitness_status} />
                        </div>
                      </div>
                      {certificate.restrictions && (
                        <div>
                          <p className="text-sm text-muted-foreground">Restrictions</p>
                          <p className="font-medium mt-1">{certificate.restrictions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">📅</span>
                      Validité
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-8">
                      <div>
                        <p className="text-sm text-muted-foreground">Date d'émission</p>
                        <p className="font-medium">
                          {new Date(certificate.issue_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {certificate.expiry_date && (
                        <div>
                          <p className="text-sm text-muted-foreground">Date d'expiration</p>
                          <p className="font-medium">
                            {new Date(certificate.expiry_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">👨‍⚕️</span>
                      Médecin
                    </h3>
                    <div className="pl-8">
                      <p className="text-sm text-muted-foreground">Médecin certifié</p>
                      <p className="font-medium">{certificate.physician_name}</p>
                    </div>
                  </div>

                  {certificate.creator && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        Créé par
                      </h3>
                      <div className="pl-8">
                        <p className="font-medium">
                          {certificate.creator.first_name} {certificate.creator.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{certificate.creator.role}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

