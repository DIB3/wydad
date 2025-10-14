import { useEffect } from 'react'
import { useVisits } from './useVisits'
import { useAuth } from '../contexts/AuthContext'
import notificationService from '../services/notification.service'
import { toast } from 'sonner'

/**
 * Hook pour détecter et notifier les visites programmées pour aujourd'hui
 */
export function useTodayScheduledVisits() {
  const { visits } = useVisits()
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id || !visits || visits.length === 0) return

    const checkTodayVisits = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Filtrer les visites programmées pour aujourd'hui
      const todayVisits = visits.filter(visit => {
        const visitDate = new Date(visit.visit_date)
        visitDate.setHours(0, 0, 0, 0)
        return visitDate.getTime() === today.getTime()
      })

      if (todayVisits.length === 0) return

      // Vérifier si on a déjà notifié aujourd'hui
      const notifiedToday = localStorage.getItem('scheduledVisitsNotified')
      const lastNotificationDate = notifiedToday ? new Date(notifiedToday) : null
      
      if (lastNotificationDate) {
        lastNotificationDate.setHours(0, 0, 0, 0)
        if (lastNotificationDate.getTime() === today.getTime()) {
          // Déjà notifié aujourd'hui
          return
        }
      }

      // Grouper par joueur
      const visitsByPlayer = {}
      todayVisits.forEach(visit => {
        const playerName = `${visit.player?.first_name || ''} ${visit.player?.last_name || ''}`.trim()
        if (!visitsByPlayer[playerName]) {
          visitsByPlayer[playerName] = []
        }
        visitsByPlayer[playerName].push(visit.module)
      })

      // Créer des notifications pour chaque joueur
      try {
        for (const [playerName, modules] of Object.entries(visitsByPlayer)) {
          const modulesList = modules.join(', ').toUpperCase()
          
          await notificationService.create({
            user_id: user.id,
            type: 'info',
            priority: 'high',
            title: '📅 Visites programmées aujourd\'hui',
            message: `${playerName} : ${modules.length} visite${modules.length > 1 ? 's' : ''} (${modulesList})`,
            link: '/visits'
          })
        }

        // Toast récapitulatif
        toast.info(`${todayVisits.length} visite${todayVisits.length > 1 ? 's' : ''} programmée${todayVisits.length > 1 ? 's' : ''} pour aujourd'hui`, {
          description: 'Consultez vos notifications',
          duration: 5000
        })

        // Marquer comme notifié aujourd'hui
        localStorage.setItem('scheduledVisitsNotified', today.toISOString())
      } catch (error) {
        console.error('Erreur lors de la création des notifications:', error)
      }
    }

    checkTodayVisits()
  }, [visits, user])

  return null
}

