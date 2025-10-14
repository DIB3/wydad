import { useState, useEffect } from 'react'
import careService from '../services/care.service'
import { useSocket } from '../contexts/SocketContext'

export function usePlayerCare(playerId) {
  const [careList, setCareList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const socket = useSocket()

  const fetchCare = async () => {
    if (!playerId) {
      setCareList([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await careService.getByPlayerId(playerId)
      setCareList(data)
      setError(null)
    } catch (err) {
      // Ne pas considérer les 404 comme des erreurs
      if (err.response?.status !== 404) {
        console.error('Erreur lors du chargement des soins:', err)
        setError(err.message)
      } else {
        // 404 = pas de données, c'est normal
        setError(null)
      }
      setCareList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCare()
  }, [playerId])

  // Écouter Socket.IO
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    const handleCareCreated = (data) => {
      if (data.visit?.player_id === playerId) {
        setCareList(prev => [data, ...prev])
      }
    }

    socket.on('visit_careCreated', handleCareCreated)

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('visit_careCreated', handleCareCreated)
      }
    }
  }, [socket, playerId])

  return {
    careList,
    loading,
    error,
    refetch: fetchCare
  }
}

