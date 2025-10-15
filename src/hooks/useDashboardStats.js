import { useState, useEffect } from 'react'
import dashboardService from '../services/dashboard.service'
import { useSocket } from '../contexts/SocketContext'

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const socket = useSocket()

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getStats()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Écouter les événements Socket.IO pour mise à jour en temps réel
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    const handleUpdate = () => {
      fetchStats()
    }

    // Écouter tous les événements qui impactent les stats
    socket.on('playerCreated', handleUpdate)
    socket.on('playerUpdated', handleUpdate)
    socket.on('playerDeleted', handleUpdate)
    socket.on('visitCreated', handleUpdate)
    socket.on('visitUpdated', handleUpdate)
    socket.on('visitDeleted', handleUpdate)
    socket.on('certificateCreated', handleUpdate)
    socket.on('certificateUpdated', handleUpdate)
    socket.on('visit_pcmaCreated', handleUpdate)
    socket.on('visit_impedanceCreated', handleUpdate)
    socket.on('visit_gpsCreated', handleUpdate)
    socket.on('visit_injuriesCreated', handleUpdate)
    socket.on('visit_nutritionCreated', handleUpdate)

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('playerCreated', handleUpdate)
        socket.off('playerUpdated', handleUpdate)
        socket.off('playerDeleted', handleUpdate)
        socket.off('visitCreated', handleUpdate)
        socket.off('visitUpdated', handleUpdate)
        socket.off('visitDeleted', handleUpdate)
        socket.off('certificateCreated', handleUpdate)
        socket.off('certificateUpdated', handleUpdate)
        socket.off('visit_pcmaCreated', handleUpdate)
        socket.off('visit_impedanceCreated', handleUpdate)
        socket.off('visit_gpsCreated', handleUpdate)
        socket.off('visit_injuriesCreated', handleUpdate)
        socket.off('visit_nutritionCreated', handleUpdate)
      }
    }
  }, [socket])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

