import { useMemo } from 'react'
import {
  Activity,
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  Settings,
  Users,
  Utensils,
  UtensilsCrossed,
  Stethoscope,
  Navigation,
  AlertCircle,
  ChevronRight,
  Heart,
  Bandage,
} from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useNavStats } from '@/hooks/useNavStats'
import { WydadLogo } from './WydadLogo'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'

const getMenuItems = (stats) => [
  {
    title: 'Tableau de bord',
    url: '/',
    icon: Home,
    badge: null,
    color: 'from-primary to-destructive',
  },
  {
    title: 'Joueurs',
    url: '/players',
    icon: Users,
    badge: stats.players > 0 ? stats.players.toString() : null,
    color: 'from-destructive to-primary',
  },
  {
    title: 'Visites',
    url: '/visits',
    icon: ClipboardList,
    badge: stats.visits > 0 ? stats.visits.toString() : null,
    color: 'from-primary to-destructive',
  },
  {
    title: 'Certificats',
    url: '/certificates',
    icon: FileText,
    badge: stats.certificates > 0 ? stats.certificates.toString() : null,
    color: 'from-destructive to-primary',
  },
  {
    title: 'Rapports',
    url: '/reports',
    icon: BarChart3,
    badge: null,
    color: 'from-primary to-destructive',
  },
  {
    title: 'Plans Nutrition',
    url: '/plans-nutrition',
    icon: UtensilsCrossed,
    badge: null,
    color: 'from-destructive to-primary',
  },
]

const moduleItems = [
  {
    title: 'PCMA',
    url: '/modules/pcma',
    icon: Stethoscope,
    description: 'Examen complet',
    color: 'from-primary to-destructive',
  },
  {
    title: 'Impédancemétrie',
    url: '/modules/impedance',
    icon: Activity,
    description: 'Composition corporelle',
    color: 'from-destructive to-primary',
  },
  {
    title: 'GPS',
    url: '/modules/gps',
    icon: Navigation,
    description: 'Performance physique',
    color: 'from-primary to-destructive',
  },
  {
    title: 'Blessures',
    url: '/modules/injuries',
    icon: AlertCircle,
    description: 'Suivi médical',
    color: 'from-destructive to-primary',
  },
  {
    title: 'Nutrition',
    url: '/modules/nutrition',
    icon: Utensils,
    description: 'Plan alimentaire',
    color: 'from-primary to-destructive',
  },
  {
    title: 'Soins',
    url: '/modules/care',
    icon: Stethoscope,
    description: 'Soins et récupération',
    color: 'from-destructive to-primary',
  },
  {
    title: 'Examen médical',
    url: '/modules/examen_medical',
    icon: Heart,
    description: 'Consultations médicales',
    color: 'from-primary to-destructive',
  },
  {
    title: 'Soins & Traitements',
    url: '/modules/soins',
    icon: Bandage,
    description: 'Soins spécialisés',
    color: 'from-destructive to-primary',
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navStats = useNavStats()
  
  // Utiliser useMemo pour éviter les problèmes d'ordre de hooks
  const menuItems = useMemo(() => getMenuItems(navStats), [navStats])

  return (
    <Sidebar className="border-r-0">
      {/* Header Wydad Athletic Club */}
      <SidebarHeader className="border-b-0 px-6 py-6 bg-gradient-to-br from-primary via-destructive to-primary relative overflow-hidden">
        {/* Effet de brillance animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        
        <div className="relative z-10 text-center">
          {/* Logo Wydad */}
          <div className="flex flex-col items-center justify-center gap-3">
            <WydadLogo className="h-10" variant="icon" />
            
            <div>
              <div className="text-2xl font-black text-white tracking-tight" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '-0.02em'
              }}>WYDAD AC</div>
              
              {/* Sous-titre Medical */}
              <div className="flex items-center justify-center mt-1">
                <div className="h-0.5 w-6 bg-gradient-to-r from-white to-white/40 rounded-full"></div>
                <span className="mx-2 text-xs font-bold text-white/90" style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}>Dossier Médical</span>
                <div className="h-0.5 w-6 bg-gradient-to-r from-white/40 to-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 bg-gradient-to-b from-slate-50 to-white">
        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-slate-400"></div>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url} className="block">
                      <div className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-300 cursor-pointer
                        ${isActive 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg scale-105' 
                          : 'hover:bg-slate-100 text-slate-700 hover:scale-102'
                        }
                      `}>
                        {/* Icône avec cercle coloré */}
                        <div className={`
                          relative flex items-center justify-center h-9 w-9 rounded-lg
                          transition-all duration-300
                          ${isActive 
                            ? 'bg-white/20' 
                            : 'bg-gradient-to-br ' + item.color + ' text-white group-hover:scale-110 group-hover:rotate-3'
                          }
                        `}>
                          <item.icon className="h-4 w-4" />
                          
                          {/* Effet de brillance au hover */}
                          {!isActive && (
                            <div className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/20 transition-all"></div>
                          )}
                        </div>

                        {/* Texte */}
                        <span className={`
                          flex-1 font-medium text-sm
                          ${isActive ? 'font-bold' : 'font-medium'}
                        `}>
                          {item.title}
                        </span>

                        {/* Badge compteur */}
                        {item.badge && (
                          <Badge className={`
                            ${isActive 
                              ? 'bg-white/30 text-white border-white/40' 
                              : 'bg-slate-200 text-slate-700 group-hover:bg-gradient-to-r group-hover:' + item.color + ' group-hover:text-white'
                            }
                            text-xs px-2 py-0.5 font-bold transition-all
                          `}>
                            {item.badge}
                          </Badge>
                        )}

                        {/* Chevron pour actif */}
                        {isActive && (
                          <ChevronRight className="h-4 w-4 animate-pulse" />
                        )}
                      </div>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Séparateur décoratif */}
        <div className="my-4 px-3">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>

        {/* Modules médicaux */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-slate-400"></div>
            Modules Médicaux
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {moduleItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url} className="block">
                      <div className={`
                        group relative px-3 py-2.5 rounded-xl
                        transition-all duration-300 cursor-pointer
                        ${isActive 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg scale-105' 
                          : 'hover:bg-slate-100 text-slate-700 hover:scale-102'
                        }
                      `}>
                        <div className="flex items-center gap-3">
                          {/* Icône */}
                          <div className={`
                            flex items-center justify-center h-9 w-9 rounded-lg
                            transition-all duration-300
                            ${isActive 
                              ? 'bg-white/20' 
                              : 'bg-gradient-to-br ' + item.color + ' text-white group-hover:scale-110'
                            }
                          `}>
                            <item.icon className="h-4 w-4" />
                          </div>

                          {/* Titre et description */}
                          <div className="flex-1 min-w-0">
                            <div className={`
                              text-sm font-medium
                              ${isActive ? 'font-bold' : 'font-medium'}
                            `}>
                              {item.title}
                            </div>
                            <div className={`
                              text-xs
                              ${isActive ? 'text-white/80' : 'text-slate-500'}
                            `}>
                              {item.description}
                            </div>
                          </div>

                          {/* Chevron */}
                          {isActive && (
                            <ChevronRight className="h-4 w-4 animate-pulse" />
                          )}
                        </div>

                        {/* Barre latérale animée pour l'item actif */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer moderne */}
      <SidebarFooter className="border-t-0 p-4 bg-gradient-to-t from-slate-100 to-transparent">
        <Link to="/settings" className="block">
          <div className={`
            group flex items-center gap-3 px-3 py-2.5 rounded-xl
            transition-all duration-300 cursor-pointer
            ${location.pathname === '/settings'
              ? 'bg-gradient-to-r from-[#C8102E] via-[#A50021] to-[#C8102E] text-white shadow-lg scale-105 border border-[#FFD700]/60'
              : 'hover:bg-red-50 text-slate-700 hover:text-[#C8102E] hover:scale-102 border border-transparent'
            }
          `}>
            <div className={`
              flex items-center justify-center h-9 w-9 rounded-lg
              transition-all duration-300
              ${location.pathname === '/settings'
                ? 'bg-white/20'
                : 'bg-gradient-to-br from-[#C8102E] to-[#A50021] text-white group-hover:scale-110 group-hover:rotate-12'
              }
            `}>
              <Settings className="h-4 w-4" />
            </div>
            <span className="flex-1 font-medium text-sm">Paramètres</span>
            {location.pathname === '/settings' && (
              <ChevronRight className="h-4 w-4 animate-pulse text-[#FFD700]" />
            )}
          </div>
        </Link>

        {/* Version info */}
        <div className="mt-3 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Version 1.0.0</span>
            <Badge className="bg-gradient-to-r from-[#29BACD] to-[#7BD5E1] text-white text-xs">
              Pro
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

