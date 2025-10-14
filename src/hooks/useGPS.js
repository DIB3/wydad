import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import gpsService from '../services/gps.service'
import { toast } from 'sonner'

export const useGPS = (visitId) => {
  const [gps, setGps] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchGPS = async () => {
    if (!visitId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await gpsService.getByVisitId(visitId)
      setGps(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      if (err.response?.status !== 404) {
        toast.error('Erreur lors du chargement du GPS')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGPS()
  }, [visitId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket) return

    socket.on('visit_gpsCreated', (data) => {
      if (data.visit_id === visitId) {
        setGps(data)
        toast.success('GPS créé')
      }
    })

    socket.on('visit_gpsUpdated', (data) => {
      if (data.visit_id === visitId) {
        setGps(data)
        toast.info('GPS mis à jour')
      }
    })

    socket.on('visit_gpsDeleted', (data) => {
      if (data.id === visitId) {
        setGps(null)
        toast.info('GPS supprimé')
      }
    })

    return () => {
      socket.off('visit_gpsCreated')
      socket.off('visit_gpsUpdated')
      socket.off('visit_gpsDeleted')
    }
  }, [socket, visitId])

  return {
    gps,
    loading,
    error,
    refetch: fetchGPS,
  }
}

export const usePlayerGPS = (playerId) => {
  const [gpsList, setGpsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const { socket } = useSocket()

  const fetchPlayerGPS = async () => {
    if (!playerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await gpsService.getByPlayerId(playerId)
      setGpsList(data)
      
      // Calculer les statistiques
      const playerStats = await gpsService.getPlayerStats(playerId)
      setStats(playerStats)
      
      setError(null)
    } catch (err) {
      // Ne pas afficher de toast pour les erreurs 404 (données non trouvées = normal)
      if (err.response?.status !== 404) {
        setError(err.message)
        toast.error('Erreur lors du chargement des GPS du joueur')
      } else {
        // 404 = pas de données, c'est normal
        setGpsList([])
        setStats(null)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayerGPS()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || !playerId) return

    socket.on('visit_gpsCreated', (data) => {
      // Vérifier que le GPS appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setGpsList((prev) => [data, ...prev])
        toast.success('Nouveau GPS créé')
        // Recalculer les stats
        fetchPlayerGPS()
      }
    })

    socket.on('visit_gpsUpdated', (data) => {
      // Vérifier que le GPS appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setGpsList((prev) =>
          prev.map((g) => (g.visit_id === data.visit_id ? data : g))
        )
        toast.info('GPS mis à jour')
        // Recalculer les stats
        fetchPlayerGPS()
      }
    })

    socket.on('visit_gpsDeleted', (data) => {
      setGpsList((prev) => prev.filter((g) => g.visit_id !== data.id))
      toast.info('GPS supprimé')
      // Recalculer les stats
      fetchPlayerGPS()
    })

    return () => {
      socket.off('visit_gpsCreated')
      socket.off('visit_gpsUpdated')
      socket.off('visit_gpsDeleted')
    }
  }, [socket, playerId])

  return {
    gpsList,
    stats,
    loading,
    error,
    refetch: fetchPlayerGPS,
  }
}

