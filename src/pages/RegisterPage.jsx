import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Mail, Lock, User, Briefcase, ArrowRight, Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: '',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(formData)
      navigate('/login')
    } catch (error) {
      console.error('Register error:', error)
    } finally {
      setLoading(false)
    }
  }

  const roleEmojis = {
    'medecin': '👨‍⚕️',
    'preparateur': '💪',
    'nutritionniste': '🥗',
    'staff': '👔',
    'admin': '⚙️'
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/10 via-[#E43E55]/10 to-[#FFD700]/10 animate-gradient" style={{ backgroundSize: '400% 400%' }}></div>
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Left side - Illustration Thème Wydad */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E] via-[#A50021] to-[#C8102E] opacity-95"></div>
        <div className="max-w-lg text-white space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 animate-pulse shadow-lg border border-[#FFD700]/40">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold">Rejoignez-nous aujourd'hui</span>
            </div>
            <h1 className="text-6xl font-bold leading-tight animate-slideInDown">
              Commencez votre <br/>
              <span className="bg-gradient-to-r from-[#FFD700] via-white to-[#FFD700] bg-clip-text text-transparent">
                aventure médicale
              </span> 🚀
            </h1>
            <p className="text-xl text-emerald-50 leading-relaxed">
              Créez votre compte et accédez à tous les outils professionnels de suivi médical et sportif
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">👥</div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-sm text-emerald-50 font-medium">Joueurs suivis</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">⚕️</div>
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-sm text-emerald-50 font-medium">Professionnels</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📊</div>
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-sm text-emerald-50 font-medium">Consultations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20 shadow-xl group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
              <div className="text-3xl font-bold mb-1">98%</div>
              <div className="text-sm text-emerald-50 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form Thème Wydad */}
      <div className="flex flex-1 items-center justify-center relative z-10 p-8">
        <Card className="w-full max-w-md border-none shadow-2xl backdrop-blur-xl bg-white/90 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#FFD700] via-[#C8102E] to-[#FFD700]"></div>
          <CardHeader className="space-y-4 text-center pt-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#C8102E] to-[#A50021] shadow-2xl animate-float">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-[#C8102E] via-[#A50021] to-[#C8102E] bg-clip-text text-transparent">
                Créer un compte ✨
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Rejoignez notre plateforme en quelques clics
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom et Prénom */}
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2 group">
                  <Label htmlFor="first_name" className="text-sm font-semibold text-slate-700 group-focus-within:text-[#C8102E] transition-colors">
                    Prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-[#C8102E] transition-colors" />
                    <Input
                      id="first_name"
                      placeholder="Ahmed"
                      className="pl-11 h-12 border-2 focus:border-[#C8102E] focus:ring-[#C8102E]/20 rounded-xl transition-all"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="last_name" className="text-sm font-semibold text-slate-700 group-focus-within:text-[#C8102E] transition-colors">
                    Nom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-[#C8102E] transition-colors" />
                    <Input
                      id="last_name"
                      placeholder="Bennani"
                      className="pl-11 h-12 border-2 focus:border-[#C8102E] focus:ring-[#C8102E]/20 rounded-xl transition-all"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 group-focus-within:text-[#C8102E] transition-colors">
                  Email professionnel
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-[#C8102E] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="medecin@wydad.ma"
                    className="pl-11 h-12 border-2 focus:border-[#C8102E] focus:ring-[#C8102E]/20 rounded-xl transition-all"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 group-focus-within:text-[#C8102E] transition-colors">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-[#C8102E] transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 border-2 focus:border-[#C8102E] focus:ring-[#C8102E]/20 rounded-xl transition-all"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                  Minimum 8 caractères
                </p>
              </div>

              {/* Rôle */}
              <div className="space-y-2 group">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700 group-focus-within:text-[#C8102E] transition-colors flex items-center gap-2">
                  Rôle professionnel
                  {formData.role && <span className="text-xl">{roleEmojis[formData.role]}</span>}
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 z-10 group-focus-within:text-[#C8102E] transition-colors" />
                  <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                    <SelectTrigger id="role" className="pl-11 h-12 border-2 focus:border-[#C8102E] focus:ring-[#C8102E]/20 rounded-xl">
                      <SelectValue placeholder="Sélectionner votre rôle..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="medecin" className="cursor-pointer">👨‍⚕️ Médecin</SelectItem>
                      <SelectItem value="preparateur" className="cursor-pointer">💪 Préparateur Physique</SelectItem>
                      <SelectItem value="nutritionniste" className="cursor-pointer">🥗 Nutritionniste</SelectItem>
                      <SelectItem value="staff" className="cursor-pointer">👔 Staff</SelectItem>
                      <SelectItem value="admin" className="cursor-pointer">⚙️ Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bouton Submit */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-[#C8102E] via-[#A50021] to-[#C8102E] hover:from-[#B50E27] hover:via-[#8F001C] hover:to-[#B50E27] text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group text-base border border-[#FFD700]/60" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Créer mon compte
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">ou</span>
                </div>
              </div>

              {/* Lien connexion */}
              <div className="text-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-red-50">
                <p className="text-sm text-slate-600">
                  Vous avez déjà un compte?{' '}
                  <Link to="/login" className="font-bold text-[#C8102E] hover:text-[#A50021] hover:underline inline-flex items-center gap-1 transition-colors">
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
