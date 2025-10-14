import { useState, useEffect, useCallback } from 'react'
import notificationService from '../services/notification.service'
import { useAuth } from '../contexts/AuthContext'
import io from 'socket.io-client'

const SOCKET_URL = 'http://localhost:4000'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await notificationService.getByUserId(user.id)
      setNotifications(data)
      
      // Calculer le nombre de non lues
      const unread = data.filter(n => !n.is_read).length
      setUnreadCount(unread)
      
      setError(null)
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Charger les notifications non lues uniquement
  const loadUnreadNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      const data = await notificationService.getUnreadByUserId(user.id)
      setNotifications(prev => {
        // Fusionner les notifications non lues avec les existantes
        const unreadIds = new Set(data.map(n => n.id))
        const readNotifications = prev.filter(n => !unreadIds.has(n.id))
        return [...data, ...readNotifications]
      })
      setUnreadCount(data.length)
    } catch (err) {
      console.error('Erreur lors du chargement des notifications non lues:', err)
    }
  }, [user])

  // Charger le compteur de notifications non lues
  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return

    try {
      const count = await notificationService.countUnreadByUserId(user.id)
      setUnreadCount(count)
    } catch (err) {
      console.error('Erreur lors du chargement du compteur:', err)
    }
  }, [user])

  // Marquer comme lue
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err)
      throw err
    }
  }, [])

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      await notificationService.markAllAsRead(user.id)
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Erreur lors du marquage de toutes comme lues:', err)
      throw err
    }
  }, [user])

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.delete(notificationId)
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          setUnreadCount(count => Math.max(0, count - 1))
        }
        return prev.filter(n => n.id !== notificationId)
      })
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      throw err
    }
  }, [])

  // Supprimer toutes les notifications lues
  const deleteAllRead = useCallback(async () => {
    if (!user?.id) return

    try {
      await notificationService.deleteAllRead(user.id)
      setNotifications(prev => prev.filter(n => !n.is_read))
    } catch (err) {
      console.error('Erreur lors de la suppression des lues:', err)
      throw err
    }
  }, [user])

  // Socket.IO pour les mises à jour en temps réel
  useEffect(() => {
    if (!user?.id) return

    const socket = io(SOCKET_URL)

    // Rejoindre la room de l'utilisateur
    socket.emit('joinUser', user.id)

    // Écouter les nouvelles notifications
    socket.on('notificationCreated', (notification) => {
      if (notification.user_id === user.id) {
        setNotifications(prev => [notification, ...prev])
        if (!notification.is_read) {
          setUnreadCount(prev => prev + 1)
        }
      }
    })

    // Écouter les notifications lues
    socket.on('notificationRead', (notification) => {
      if (notification.user_id === user.id) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    })

    // Écouter les suppressions
    socket.on('notificationDeleted', ({ id }) => {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id)
        if (notification && !notification.is_read) {
          setUnreadCount(count => Math.max(0, count - 1))
        }
        return prev.filter(n => n.id !== id)
      })
    })

    // Cleanup
    return () => {
      socket.disconnect()
    }
  }, [user])

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    loadNotifications,
    loadUnreadNotifications,
    loadUnreadCount
  }
}

