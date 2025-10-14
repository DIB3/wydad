import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import visitService from '../services/visit.service'
import { toast } from 'sonner'

export const useVisits = () => {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchVisits = async () => {
    try {
      setLoading(true)
      const data = await visitService.getAll()
      setVisits(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      toast.error('Erreur lors du chargement des visites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisits()
  }, [])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    socket.on('visitCreated', (data) => {
      setVisits((prev) => [data, ...prev])
      toast.success('Nouvelle visite créée')
    })

    socket.on('visitUpdated', (data) => {
      setVisits((prev) =>
        prev.map((v) => (v.id === data.id ? data : v))
      )
      toast.info('Visite mise à jour')
    })

    socket.on('visitDeleted', (data) => {
      setVisits((prev) => prev.filter((v) => v.id !== data.id))
      toast.info('Visite supprimée')
    })

    socket.on('visitValidated', (data) => {
      setVisits((prev) =>
        prev.map((v) => (v.id === data.visitId ? { ...v, is_validated: true } : v))
      )
      toast.success('Visite validée')
    })

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('visitCreated')
        socket.off('visitUpdated')
        socket.off('visitDeleted')
        socket.off('visitValidated')
      }
    }
  }, [socket])

  return {
    visits,
    loading,
    error,
    refetch: fetchVisits,
  }
}

