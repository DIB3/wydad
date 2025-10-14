import { useState, useEffect } from 'react'
import reportsService from '../services/reports.service'
import { useSocket } from '../contexts/SocketContext'

export function useReports() {
  const [reportsData, setReportsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const socket = useSocket()

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await reportsService.getAllReportsData()
      setReportsData(data)
      setError(null)
    } catch (err) {
      console.error('Erreur lors du chargement des rapports:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Écouter les événements Socket.IO pour mise à jour en temps réel
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    const handleUpdate = () => {
      console.log('📊 Mise à jour des rapports...')
      fetchReports()
    }

    // Écouter tous les événements qui impactent les rapports
    socket.on('playerCreated', handleUpdate)
    socket.on('playerUpdated', handleUpdate)
    socket.on('visitCreated', handleUpdate)
    socket.on('visitUpdated', handleUpdate)
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
        socket.off('visitCreated', handleUpdate)
        socket.off('visitUpdated', handleUpdate)
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
    reportsData,
    loading,
    error,
    refetch: fetchReports
  }
}

