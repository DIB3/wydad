import { User, Settings, LogOut, UserCircle } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function UserDropdown() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    // Confirmation avant déconnexion
    const confirmLogout = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')
    
    if (confirmLogout) {
      logout()
      toast.success('👋 À bientôt ! Déconnexion réussie.')
      // Redirection vers la page de connexion
      navigate('/login')
    }
  }

  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return 'U'
    const firstInitial = user.first_name?.[0] || ''
    const lastInitial = user.last_name?.[0] || ''
    return (firstInitial + lastInitial).toUpperCase()
  }

  // Couleurs d'avatar basées sur le rôle
  const getRoleColor = () => {
    const roleColors = {
      admin: 'bg-gradient-to-br from-purple-500 to-purple-600',
      medecin: 'bg-gradient-to-br from-blue-500 to-blue-600',
      preparateur: 'bg-gradient-to-br from-green-500 to-green-600',
      nutritionniste: 'bg-gradient-to-br from-orange-500 to-orange-600',
      staff: 'bg-gradient-to-br from-gray-500 to-gray-600',
      joueur: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
    }
    return roleColors[user?.role] || 'bg-gradient-to-br from-slate-500 to-slate-600'
  }

  const getRoleLabel = () => {
    const roleLabels = {
      admin: 'Administrateur',
      medecin: 'Médecin',
      preparateur: 'Préparateur',
      nutritionniste: 'Nutritionniste',
      staff: 'Staff',
      joueur: 'Joueur'
    }
    return roleLabels[user?.role] || user?.role
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all bg-transparent border-0 cursor-pointer"
        >
          {/* Avatar avec initiales */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getRoleColor()} text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow`}>
            {getInitials()}
          </div>
          
          {/* Indicateur en ligne (point vert) */}
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        {/* En-tête avec informations utilisateur */}
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center gap-3">
            {/* Avatar plus grand dans le menu */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getRoleColor()} text-white font-bold text-lg shadow-md`}>
              {getInitials()}
            </div>
            
            {/* Informations */}
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground leading-none">
                {user?.email}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Menu items */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Mon Profil</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

