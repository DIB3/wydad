import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Link } from 'react-router-dom'
import { 
  UserPlus, 
  ClipboardPlus, 
  FileText, 
  Calendar,
  BarChart3,
  Utensils,
  UtensilsCrossed,
  Settings
} from 'lucide-react'

const quickActions = [
  {
    title: 'Nouveau joueur',
    description: 'Ajouter un joueur',
    icon: UserPlus,
    href: '/players',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Nouvelle visite',
    description: 'Créer une consultation',
    icon: ClipboardPlus,
    href: '/visits/new',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Certificats',
    description: 'Gérer les certificats',
    icon: FileText,
    href: '/certificates',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Visites',
    description: 'Historique des visites',
    icon: Calendar,
    href: '/visits',
    color: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Rapports',
    description: 'Statistiques détaillées',
    icon: BarChart3,
    href: '/reports',
    color: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Plans Nutrition',
    description: 'Gestion nutrition',
    icon: UtensilsCrossed,
    href: '/plans-nutrition',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Gestion Repas',
    description: 'Planifier les repas',
    icon: Utensils,
    href: '/gestion-repas',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    title: 'Paramètres',
    description: 'Configuration',
    icon: Settings,
    href: '/settings',
    color: 'from-gray-500 to-gray-600'
  }
]

export function QuickActions() {
  return (
    <Card className="shadow-lg border-none overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="text-2xl">⚡</div>
          <div>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès directs aux fonctionnalités principales</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link 
              key={action.title}
              to={action.href}
              className="group cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300 bg-white hover:scale-105 hover:-translate-y-1">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">{action.title}</p>
                  <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

