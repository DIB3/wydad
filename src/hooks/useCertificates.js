import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import certificateService from '../services/certificate.service'
import { toast } from 'sonner'

export const useCertificates = () => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const data = await certificateService.getAll()
      setCertificates(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      toast.error('Erreur lors du chargement des certificats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    socket.on('certificateCreated', (data) => {
      setCertificates((prev) => [data, ...prev])
      toast.success('Nouveau certificat créé')
    })

    socket.on('certificateUpdated', (data) => {
      setCertificates((prev) =>
        prev.map((c) => (c.id === data.id ? data : c))
      )
      toast.info('Certificat mis à jour')
    })

    socket.on('certificateDeleted', (data) => {
      setCertificates((prev) => prev.filter((c) => c.id !== data.id))
      toast.info('Certificat supprimé')
    })

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('certificateCreated')
        socket.off('certificateUpdated')
        socket.off('certificateDeleted')
      }
    }
  }, [socket])

  return {
    certificates,
    loading,
    error,
    refetch: fetchCertificates,
  }
}

