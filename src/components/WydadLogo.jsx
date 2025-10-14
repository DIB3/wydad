import React from 'react'
import wacLogo from '../images/wac.webp'

export function WydadLogo({ className = "h-10 w-10", variant = "full" }) {
  if (variant === "icon") {
    // Logo officiel Wydad pour header/icônes
    return (
      <img 
        src={wacLogo}
        alt="Wydad Athletic Club"
        className={`${className} object-contain`}
      />
    )
  }

  // Logo complet avec texte
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={wacLogo}
        alt="Wydad Athletic Club"
        className="h-12 w-12 object-contain"
      />
      
      <div className="flex flex-col">
        <span className="text-xl font-bold text-primary leading-tight">WYDAD AC</span>
        <span className="text-xs text-muted-foreground leading-tight">Casablanca 1937</span>
      </div>
    </div>
  )
}

// Logo officiel animé pour la page de connexion
export function WydadLogoAnimated({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Cercle de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-destructive rounded-full blur-xl opacity-50 animate-pulse"></div>
      
      {/* Logo officiel Wydad */}
      <img 
        src={wacLogo}
        alt="Wydad Athletic Club"
        className="relative h-20 w-20 object-contain drop-shadow-2xl"
      />
    </div>
  )
}

// Badge Wydad pour décoration avec logo officiel
export function WydadBadge({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 ${className}`}>
      <img 
        src={wacLogo}
        alt="Wydad Athletic Club"
        className="h-6 w-6 object-contain"
      />
      <span className="text-sm font-semibold text-primary">Wydad Athletic Club</span>
    </div>
  )
}

