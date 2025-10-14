import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import attachmentService from '../services/attachment.service'

export const usePlayerAttachments = (playerId) => {
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchAttachments = async () => {
    if (!playerId) return
    
    try {
      setLoading(true)
      const data = await attachmentService.getByEntity('player', playerId)
      setAttachments(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erreur attachments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttachments()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    socket.on('attachmentCreated', (data) => {
      if (data.entity_type === 'player' && data.entity_id === playerId) {
        setAttachments((prev) => [data, ...prev])
      }
    })

    socket.on('attachmentUpdated', (data) => {
      if (data.entity_type === 'player' && data.entity_id === playerId) {
        setAttachments((prev) =>
          prev.map((a) => (a.id === data.id ? data : a))
        )
      }
    })

    socket.on('attachmentDeleted', (data) => {
      setAttachments((prev) => prev.filter((a) => a.id !== data.id))
    })

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('attachmentCreated')
        socket.off('attachmentUpdated')
        socket.off('attachmentDeleted')
      }
    }
  }, [socket, playerId])

  return {
    attachments,
    loading,
    error,
    refetch: fetchAttachments,
  }
}

