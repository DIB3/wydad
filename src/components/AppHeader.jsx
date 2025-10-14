import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationDropdown } from './NotificationDropdown'
import { UserDropdown } from './UserDropdown'
import { WydadLogo } from './WydadLogo'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 px-6 shadow-sm border-b-4 border-[#FFD700] bg-gradient-to-r from-[#C8102E] via-[#A50021] to-[#C8102E] text-white">
      <SidebarTrigger />
      
      {/* Logo Wydad dans le header */}
      <div className="hidden md:block">
        <WydadLogo className="h-8" variant="icon" />
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
          <Input type="search" placeholder="Rechercher un joueur, une visite..." className="pl-9 bg-white text-slate-900 placeholder:text-slate-500" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        
        <UserDropdown />
      </div>
    </header>
  )
}

