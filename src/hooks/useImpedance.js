import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import impedanceService from '../services/impedance.service'
import { toast } from 'sonner'

export const useImpedance = (visitId) => {
  const [impedance, setImpedance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchImpedance = async () => {
    if (!visitId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await impedanceService.getByVisitId(visitId)
      setImpedance(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      if (err.response?.status !== 404) {
        toast.error('Erreur lors du chargement de l\'impédancemétrie')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImpedance()
  }, [visitId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket) return

    socket.on('visit_impedanceCreated', (data) => {
      if (data.visit_id === visitId) {
        setImpedance(data)
        toast.success('Impédancemétrie créée')
      }
    })

    socket.on('visit_impedanceUpdated', (data) => {
      if (data.visit_id === visitId) {
        setImpedance(data)
        toast.info('Impédancemétrie mise à jour')
      }
    })

    socket.on('visit_impedanceDeleted', (data) => {
      if (data.id === visitId) {
        setImpedance(null)
        toast.info('Impédancemétrie supprimée')
      }
    })

    return () => {
      socket.off('visit_impedanceCreated')
      socket.off('visit_impedanceUpdated')
      socket.off('visit_impedanceDeleted')
    }
  }, [socket, visitId])

  return {
    impedance,
    loading,
    error,
    refetch: fetchImpedance,
  }
}

export const usePlayerImpedance = (playerId) => {
  const [impedanceList, setImpedanceList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchPlayerImpedance = async () => {
    if (!playerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await impedanceService.getByPlayerId(playerId)
      setImpedanceList(data)
      setError(null)
    } catch (err) {
      // Ne pas afficher de toast pour les erreurs 404 (données non trouvées = normal)
      if (err.response?.status !== 404) {
        setError(err.message)
        toast.error('Erreur lors du chargement des impédancemétries du joueur')
      } else {
        // 404 = pas de données, c'est normal
        setImpedanceList([])
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayerImpedance()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || !playerId) return

    socket.on('visit_impedanceCreated', (data) => {
      // Vérifier que l'impédance appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setImpedanceList((prev) => [data, ...prev])
        toast.success('Nouvelle impédancemétrie créée')
      }
    })

    socket.on('visit_impedanceUpdated', (data) => {
      // Vérifier que l'impédance appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setImpedanceList((prev) =>
          prev.map((i) => (i.visit_id === data.visit_id ? data : i))
        )
        toast.info('Impédancemétrie mise à jour')
      }
    })

    socket.on('visit_impedanceDeleted', (data) => {
      setImpedanceList((prev) => prev.filter((i) => i.visit_id !== data.id))
      toast.info('Impédancemétrie supprimée')
    })

    return () => {
      socket.off('visit_impedanceCreated')
      socket.off('visit_impedanceUpdated')
      socket.off('visit_impedanceDeleted')
    }
  }, [socket, playerId])

  return {
    impedanceList,
    loading,
    error,
    refetch: fetchPlayerImpedance,
  }
}

