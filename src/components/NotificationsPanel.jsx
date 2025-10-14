import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const notificationIcons = {
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  alert: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' }
}

export function NotificationsPanel() {
  const { notifications, loading, markAsRead, deleteNotification, markAllAsRead } = useNotifications()

  const dismissNotification = async (id) => {
    try {
      await deleteNotification(id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
    normal: 'border-l-blue-500'
  }

  // Limiter à 5 notifications pour le panel du dashboard
  const displayedNotifications = notifications.slice(0, 5)
  const unreadNotifications = notifications.filter(n => !n.is_read)

  return (
    <Card className="shadow-lg border-none backdrop-blur-sm bg-white/80">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🔔</div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Notifications
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Alertes et mises à jour importantes</CardDescription>
            </div>
          </div>
          {unreadNotifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#29BACD] mx-auto mb-4" />
            <p className="text-sm text-slate-500">Chargement des notifications...</p>
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((notification) => {
                const notificationType = notification.type || 'info'
                const { icon: Icon, color, bg } = notificationIcons[notificationType] || notificationIcons.info
                const priority = notification.priority || 'normal'
                
                return (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-slate-50 transition-colors border-l-4 ${priorityColors[priority]} relative group ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${bg}`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                              {!notification.is_read && (
                                <Badge className="bg-[#29BACD] text-white text-xs px-1.5 py-0">Nouveau</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-slate-400">
                                {(() => {
                                  try {
                                    const date = new Date(notification.created_at)
                                    if (isNaN(date.getTime())) {
                                      return 'À l\'instant'
                                    }
                                    return formatDistanceToNow(date, { 
                                      addSuffix: true, 
                                      locale: fr 
                                    })
                                  } catch {
                                    return 'À l\'instant'
                                  }
                                })()}
                              </span>
                              {notification.link && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                  <a href={notification.link} className="flex items-center gap-1">
                                    Voir détails
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => dismissNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-sm text-slate-500">Aucune notification</p>
                <p className="text-xs text-slate-400 mt-2">Vous êtes à jour !</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

