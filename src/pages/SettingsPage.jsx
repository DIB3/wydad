import { useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/Separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Bell, 
  Palette, 
  Database, 
  Shield, 
  Globe,
  Save,
  Mail,
  Lock,
  Building2,
  FileText
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import userService from '../services/user.service'
import { useEffect } from 'react'
import wacLogo from '../images/wac.webp'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // État pour les paramètres
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    phone: '',
    address: '',
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    visitCreated: true,
    visitUpdated: true,
    certificateExpiring: true,
    playerStatusChange: true,
  })

  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'fr',
    compactMode: false,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Charger les données de l'utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          setLoading(true)
          const userData = await userService.getById(user.id)
          setProfileData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            role: userData.role || '',
            phone: userData.phone || '',
            address: userData.address || '',
          })
        } catch (error) {
          console.error('Erreur chargement profil:', error)
          toast.error('Erreur lors du chargement du profil')
        } finally {
          setLoading(false)
        }
      }
    }

    loadUserData()
  }, [user?.id])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Mettre à jour via l'API
      const updatedUser = await userService.update(user.id, profileData)
      
      // Mettre à jour le contexte Auth
      if (updateUser) {
        updateUser(updatedUser)
      }
      
      toast.success('Profil mis à jour avec succès!')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      // Sauvegarder les préférences de notifications
      await userService.update(user.id, {
        notification_preferences: JSON.stringify(notifications)
      })
      toast.success('Préférences de notifications mises à jour!')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAppearance = async () => {
    setSaving(true)
    try {
      // Sauvegarder les préférences d'apparence
      await userService.update(user.id, {
        appearance_preferences: JSON.stringify(appearance)
      })
      toast.success('Préférences d\'apparence mises à jour!')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setSaving(true)
    try {
      // Appeler l'API pour changer le mot de passe
      await userService.update(user.id, {
        password: passwordData.newPassword
      })
      
      toast.success('Mot de passe modifié avec succès!')
      
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-6 p-6">
            {/* Page Header - Wydad Style */}
            <div className="rounded-xl overflow-hidden border border-red-200 shadow-sm">
              <div className="relative">
                {/* Bandeau or avec logo et titre au-dessus (sur l'or) */}
                <div className="h-24 bg-[#C8102E] border-b-4 border-[#C8102E] flex items-center">
                  <div className="flex items-center gap-4 px-6">
                    <img src={wacLogo} alt="Wydad" className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white object-cover" />
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-[white]">Paramètres</h1>
                      <p className="text-sm text-[white]/80">Gérez vos préférences et paramètres de compte</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bandeau inférieur supprimé (badges) */}
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Apparence
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="system" className="gap-2">
                  <Database className="h-4 w-4" />
                  Système
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>
                      Mettez à jour vos informations de profil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input
                          id="first_name"
                          value={profileData.first_name}
                          onChange={(e) =>
                            setProfileData({ ...profileData, first_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input
                          id="last_name"
                          value={profileData.last_name}
                          onChange={(e) =>
                            setProfileData({ ...profileData, last_name: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="role">Rôle</Label>
                        <div className="flex items-center gap-2">
                          <Input id="role" value={profileData.role} disabled />
                          <Badge variant="outline">{profileData.role}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Le rôle ne peut pas être modifié. Contactez un administrateur.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Textarea
                        id="address"
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({ ...profileData, address: e.target.value })
                        }
                        placeholder="Adresse complète..."
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <CardTitle>Changer le mot de passe</CardTitle>
                    <CardDescription>
                      Mettez à jour votre mot de passe pour sécuriser votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Mot de passe actuel</Label>
                      <Input 
                        id="current_password" 
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new_password">Nouveau mot de passe</Label>
                        <Input 
                          id="new_password" 
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                        <Input 
                          id="confirm_password" 
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={handleChangePassword}
                        disabled={saving}
                      >
                        <Lock className="h-4 w-4" />
                        {saving ? 'Modification...' : 'Changer le mot de passe'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications par email</CardTitle>
                    <CardDescription>
                      Configurez les notifications que vous souhaitez recevoir par email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Activer les notifications email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des emails pour les événements importants
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, emailNotifications: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Types de notifications</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="visitCreated">Nouvelle visite créée</Label>
                          <p className="text-sm text-muted-foreground">
                            Notification lors de la création d'une visite
                          </p>
                        </div>
                        <Switch
                          id="visitCreated"
                          checked={notifications.visitCreated}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, visitCreated: checked })
                          }
                          disabled={!notifications.emailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="visitUpdated">Visite mise à jour</Label>
                          <p className="text-sm text-muted-foreground">
                            Notification lors de la modification d'une visite
                          </p>
                        </div>
                        <Switch
                          id="visitUpdated"
                          checked={notifications.visitUpdated}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, visitUpdated: checked })
                          }
                          disabled={!notifications.emailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="certificateExpiring">Certificats arrivant à expiration</Label>
                          <p className="text-sm text-muted-foreground">
                            Alerte 30 jours avant l'expiration d'un certificat
                          </p>
                        </div>
                        <Switch
                          id="certificateExpiring"
                          checked={notifications.certificateExpiring}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, certificateExpiring: checked })
                          }
                          disabled={!notifications.emailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="playerStatusChange">Changement de statut joueur</Label>
                          <p className="text-sm text-muted-foreground">
                            Notification lors du changement d'aptitude d'un joueur
                          </p>
                        </div>
                        <Switch
                          id="playerStatusChange"
                          checked={notifications.playerStatusChange}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, playerStatusChange: checked })
                          }
                          disabled={!notifications.emailNotifications}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        Enregistrer les préférences
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Push Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications push</CardTitle>
                    <CardDescription>
                      Recevez des notifications en temps réel dans l'application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications">Activer les notifications push</Label>
                        <p className="text-sm text-muted-foreground">
                          Afficher des toasts pour les événements importants
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, pushNotifications: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thème</CardTitle>
                    <CardDescription>
                      Personnalisez l'apparence de l'interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Mode d'affichage</Label>
                      <Select value={appearance.theme} onValueChange={(value) => setAppearance({ ...appearance, theme: value })}>
                        <SelectTrigger id="theme">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="system">Système</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="compactMode">Mode compact</Label>
                        <p className="text-sm text-muted-foreground">
                          Réduire l'espacement pour afficher plus de contenu
                        </p>
                      </div>
                      <Switch
                        id="compactMode"
                        checked={appearance.compactMode}
                        onCheckedChange={(checked) =>
                          setAppearance({ ...appearance, compactMode: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <Select value={appearance.language} onValueChange={(value) => setAppearance({ ...appearance, language: value })}>
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button onClick={handleSaveAppearance} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        Enregistrer les préférences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité du compte</CardTitle>
                    <CardDescription>
                      Gérez la sécurité de votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-success mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Compte sécurisé</p>
                          <p className="text-sm text-muted-foreground">
                            Votre compte est protégé par un mot de passe et JWT
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Informations de connexion</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Email de connexion</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Mot de passe</p>
                            <p className="text-sm text-muted-foreground">••••••••</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Lock className="h-4 w-4 mr-2" />
                            Changer
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Sessions actives</h4>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Session actuelle</p>
                            <p className="text-sm text-muted-foreground">
                              Windows • Chrome • {new Date().toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-success text-success">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Tab */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations système</CardTitle>
                    <CardDescription>
                      Détails sur la configuration et la connexion
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Configuration API</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">URL de l'API</p>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {import.meta.env.VITE_API_URL || 'http://localhost:4000'}
                          </p>
                        </div>

                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">WebSocket</p>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {import.meta.env.VITE_WS_URL || 'http://localhost:4000'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Version de l'application</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                          <p className="text-sm font-medium mb-1">Frontend</p>
                          <p className="text-sm text-muted-foreground">React 18 + Vite</p>
                          <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
                        </div>

                        <div className="rounded-lg border p-4">
                          <p className="text-sm font-medium mb-1">Backend</p>
                          <p className="text-sm text-muted-foreground">Node.js + Express</p>
                          <p className="text-xs text-muted-foreground mt-1">Widad API 1.0.0</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Stockage local</h4>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Données en cache</p>
                            <p className="text-sm text-muted-foreground">
                              Token JWT et préférences utilisateur
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              localStorage.clear()
                              toast.success('Cache vidé avec succès')
                              window.location.href = '/login'
                            }}
                          >
                            Vider le cache
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Organization Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Organisation</CardTitle>
                    <CardDescription>
                      Paramètres de votre organisation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org_name">Nom de l'organisation</Label>
                      <Input id="org_name" placeholder="FC Exemple" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="org_address">Adresse</Label>
                        <Input id="org_address" placeholder="123 Rue du Stade" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org_phone">Téléphone</Label>
                        <Input id="org_phone" type="tel" placeholder="+33 1 23 45 67 89" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="org_logo">Logo de l'organisation</Label>
                      <Input id="org_logo" type="file" accept="image/*" />
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Enregistrer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Export & Import */}
                <Card>
                  <CardHeader>
                    <CardTitle>Export et sauvegarde</CardTitle>
                    <CardDescription>
                      Exporter vos données ou importer une sauvegarde
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Exporter toutes les données (Excel)
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Database className="h-4 w-4" />
                        Sauvegarder la base de données
                      </Button>
                    </div>
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

