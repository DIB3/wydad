import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import auditLogService from '../services/auditLog.service'

export const usePlayerAuditLogs = (playerId) => {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchAuditLogs = async () => {
    if (!playerId) return
    
    try {
      setLoading(true)
      const data = await auditLogService.getByEntity('player', playerId)
      setAuditLogs(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erreur audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    socket.on('auditLogCreated', (data) => {
      if (data.entity === 'player' && data.entity_id === playerId) {
        setAuditLogs((prev) => [data, ...prev])
      }
    })

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('auditLogCreated')
      }
    }
  }, [socket, playerId])

  return {
    auditLogs,
    loading,
    error,
    refetch: fetchAuditLogs,
  }
}

