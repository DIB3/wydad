import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import injuriesService from '../services/injuries.service'
import { toast } from 'sonner'

export const useInjuries = (visitId) => {
  const [injury, setInjury] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchInjury = async () => {
    if (!visitId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await injuriesService.getByVisitId(visitId)
      setInjury(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      if (err.response?.status !== 404) {
        toast.error('Erreur lors du chargement de la blessure')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInjury()
  }, [visitId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket) return

    socket.on('visit_injuriesCreated', (data) => {
      if (data.visit_id === visitId) {
        setInjury(data)
        toast.success('Blessure créée')
      }
    })

    socket.on('visit_injuriesUpdated', (data) => {
      if (data.visit_id === visitId) {
        setInjury(data)
        toast.info('Blessure mise à jour')
      }
    })

    socket.on('visit_injuriesDeleted', (data) => {
      if (data.id === visitId) {
        setInjury(null)
        toast.info('Blessure supprimée')
      }
    })

    return () => {
      socket.off('visit_injuriesCreated')
      socket.off('visit_injuriesUpdated')
      socket.off('visit_injuriesDeleted')
    }
  }, [socket, visitId])

  return {
    injury,
    loading,
    error,
    refetch: fetchInjury,
  }
}

export const usePlayerInjuries = (playerId) => {
  const [injuriesList, setInjuriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const { socket } = useSocket()

  const fetchPlayerInjuries = async () => {
    if (!playerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await injuriesService.getByPlayerId(playerId)
      setInjuriesList(data)
      
      // Calculer les statistiques
      const playerStats = await injuriesService.getPlayerInjuryStats(playerId)
      setStats(playerStats)
      
      setError(null)
    } catch (err) {
      // Ne pas afficher de toast pour les erreurs 404 (données non trouvées = normal)
      if (err.response?.status !== 404) {
        setError(err.message)
        toast.error('Erreur lors du chargement des blessures du joueur')
      } else {
        // 404 = pas de données, c'est normal
        setInjuriesList([])
        setStats(null)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayerInjuries()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || !playerId) return

    socket.on('visit_injuriesCreated', (data) => {
      // Vérifier que la blessure appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setInjuriesList((prev) => [data, ...prev])
        toast.success('Nouvelle blessure créée')
        // Recalculer les stats
        fetchPlayerInjuries()
      }
    })

    socket.on('visit_injuriesUpdated', (data) => {
      // Vérifier que la blessure appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setInjuriesList((prev) =>
          prev.map((i) => (i.visit_id === data.visit_id ? data : i))
        )
        toast.info('Blessure mise à jour')
        // Recalculer les stats
        fetchPlayerInjuries()
      }
    })

    socket.on('visit_injuriesDeleted', (data) => {
      setInjuriesList((prev) => prev.filter((i) => i.visit_id !== data.id))
      toast.info('Blessure supprimée')
      // Recalculer les stats
      fetchPlayerInjuries()
    })

    return () => {
      socket.off('visit_injuriesCreated')
      socket.off('visit_injuriesUpdated')
      socket.off('visit_injuriesDeleted')
    }
  }, [socket, playerId])

  return {
    injuriesList,
    stats,
    loading,
    error,
    refetch: fetchPlayerInjuries,
  }
}

