import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import certificateService from '../services/certificate.service'

export const usePlayerCertificates = (playerId) => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchCertificates = async () => {
    if (!playerId) return
    
    try {
      setLoading(true)
      const data = await certificateService.getByPlayerId(playerId)
      setCertificates(data)
      setError(null)
    } catch (err) {
      // Ne pas considérer les 404 comme des erreurs
      if (err.response?.status !== 404) {
        setError(err.message)
        console.error('Erreur certificats:', err)
      } else {
        // 404 = pas de données, c'est normal
        setCertificates([])
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    socket.on('certificateCreated', (data) => {
      if (data.player_id === playerId) {
        setCertificates((prev) => [data, ...prev])
      }
    })

    socket.on('certificateUpdated', (data) => {
      if (data.player_id === playerId) {
        setCertificates((prev) =>
          prev.map((c) => (c.id === data.id ? data : c))
        )
      }
    })

    socket.on('certificateDeleted', (data) => {
      setCertificates((prev) => prev.filter((c) => c.id !== data.id))
    })

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('certificateCreated')
        socket.off('certificateUpdated')
        socket.off('certificateDeleted')
      }
    }
  }, [socket, playerId])

  return {
    certificates,
    loading,
    error,
    refetch: fetchCertificates,
  }
}

