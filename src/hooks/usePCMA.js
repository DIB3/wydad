import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import pcmaService from '../services/pcma.service'
import { toast } from 'sonner'

export const usePCMA = (visitId) => {
  const [pcma, setPcma] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchPCMA = async () => {
    if (!visitId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await pcmaService.getByVisitId(visitId)
      setPcma(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      if (err.response?.status !== 404) {
        toast.error('Erreur lors du chargement du PCMA')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPCMA()
  }, [visitId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket) return

    socket.on('visit_pcmaCreated', (data) => {
      if (data.visit_id === visitId) {
        setPcma(data)
        toast.success('PCMA créé')
      }
    })

    socket.on('visit_pcmaUpdated', (data) => {
      if (data.visit_id === visitId) {
        setPcma(data)
        toast.info('PCMA mis à jour')
      }
    })

    socket.on('visit_pcmaDeleted', (data) => {
      if (data.id === visitId) {
        setPcma(null)
        toast.info('PCMA supprimé')
      }
    })

    return () => {
      socket.off('visit_pcmaCreated')
      socket.off('visit_pcmaUpdated')
      socket.off('visit_pcmaDeleted')
    }
  }, [socket, visitId])

  return {
    pcma,
    loading,
    error,
    refetch: fetchPCMA,
  }
}

export const usePlayerPCMA = (playerId) => {
  const [pcmaList, setPcmaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchPlayerPCMA = async () => {
    if (!playerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await pcmaService.getByPlayerId(playerId)
      setPcmaList(data)
      setError(null)
    } catch (err) {
      // Ne pas afficher de toast pour les erreurs 404 (données non trouvées = normal)
      if (err.response?.status !== 404) {
        setError(err.message)
        toast.error('Erreur lors du chargement des PCMA du joueur')
      } else {
        // 404 = pas de données, c'est normal
        setPcmaList([])
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayerPCMA()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || !playerId) return

    socket.on('visit_pcmaCreated', (data) => {
      // Vérifier que le PCMA appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setPcmaList((prev) => [data, ...prev])
        toast.success('Nouveau PCMA créé')
      }
    })

    socket.on('visit_pcmaUpdated', (data) => {
      // Vérifier que le PCMA appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setPcmaList((prev) =>
          prev.map((p) => (p.visit_id === data.visit_id ? data : p))
        )
        toast.info('PCMA mis à jour')
      }
    })

    socket.on('visit_pcmaDeleted', (data) => {
      setPcmaList((prev) => prev.filter((p) => p.visit_id !== data.id))
      toast.info('PCMA supprimé')
    })

    return () => {
      socket.off('visit_pcmaCreated')
      socket.off('visit_pcmaUpdated')
      socket.off('visit_pcmaDeleted')
    }
  }, [socket, playerId])

  return {
    pcmaList,
    loading,
    error,
    refetch: fetchPlayerPCMA,
  }
}

