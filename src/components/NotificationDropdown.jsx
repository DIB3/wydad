import { useState, useMemo } from 'react'
import { Bell, X, AlertTriangle, Info, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Link } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const notificationIcons = {
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  alert: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
}

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()
  
  const [open, setOpen] = useState(false)

  // Formater le temps relatif
  const formatTime = (dateString) => {
    try {
      if (!dateString) return 'À l\'instant'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'À l\'instant'
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: fr
      })
    } catch {
      return 'À l\'instant'
    }
  }

  // Afficher uniquement les 10 dernières notifications
  const displayedNotifications = useMemo(() => {
    return notifications.slice(0, 10)
  }, [notifications])

  const dismissNotification = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await deleteNotification(id)
      toast.success('Notification supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id)
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error)
      }
    }
    setOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('Toutes les notifications ont été marquées comme lues')
    } catch (error) {
      toast.error('Erreur lors du marquage')
    }
  }

  const hasNotifications = displayedNotifications.length > 0

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white z-10">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <span className="absolute right-1 top-1 h-4 w-4 animate-ping rounded-full bg-red-400 opacity-75"></span>
            </>
          )}
          <span className="sr-only">Notifications</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-700" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Liste des notifications */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : hasNotifications ? (
            <div className="divide-y">
              {displayedNotifications.map((notification) => {
                const { icon: Icon, color, bg } = notificationIcons[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={`group relative p-4 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Icône */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 leading-tight">
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-slate-400">
                                {formatTime(notification.created_at)}
                              </span>
                              {notification.link && (
                                <Link
                                  to={notification.link}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  Voir détails
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Bouton fermer */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => dismissNotification(notification.id, e)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-5xl mb-3">✨</div>
              <p className="text-sm font-medium text-slate-900">Aucune notification</p>
              <p className="text-xs text-slate-500 mt-1">Vous êtes à jour !</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasNotifications && (
          <div className="border-t p-3 bg-slate-50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-sm"
              asChild
            >
              <Link to="/notifications" onClick={() => setOpen(false)}>
                Voir toutes les notifications
              </Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

