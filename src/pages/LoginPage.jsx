import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { WydadLogoAnimated, WydadBadge } from '../components/WydadLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            {/* Logo Wydad Animé */}
            <div className="mx-auto">
              <WydadLogoAnimated />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
                Bon retour ! 🔴⚪
              </CardTitle>
              <CardDescription className="text-base">
                Wydad Athletic Club - Dossier Médical
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="medecin@club.fr"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-primary to-destructive hover:from-destructive hover:to-primary text-white font-medium shadow-lg group" 
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte?{' '}
                <Link to="/register" className="font-semibold text-primary hover:text-destructive hover:underline">
                  Créer un compte 🚀
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Illustration Wydad */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary via-destructive to-primary p-12">
        <div className="max-w-lg text-white space-y-8">
          <div className="space-y-4">
            <WydadBadge className="bg-white/20 backdrop-blur-sm" />
            <h1 className="text-5xl font-bold leading-tight">
              Wydad Athletic Club 🏆
            </h1>
            <p className="text-xl text-white/90">
              Plateforme médicale pour gérer la santé et les performances de nos champions
            </p>
            <div className="text-sm text-white/80 italic">
              "Porter le maillot du Wydad est un honneur, le mouiller est un devoir"
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="font-semibold text-lg">Suivi en temps réel</h3>
                <p className="text-sm text-white/80">Monitorer les performances GPS, impédance et nutrition</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
              <div className="text-3xl">⚕️</div>
              <div>
                <h3 className="font-semibold text-lg">Gestion médicale</h3>
                <p className="text-sm text-white/80">Certificats, blessures et historique médical complet</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
              <div className="text-3xl">🏆</div>
              <div>
                <h3 className="font-semibold text-lg">Excellence sportive</h3>
                <p className="text-sm text-white/80">Le club le plus titré du Maroc depuis 1937</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
