import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import playerService from '../services/player.service'
import notificationService from '../services/notification.service'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

export const usePlayers = () => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()
  const { user } = useAuth()

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const data = await playerService.getAll()
      setPlayers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      toast.error('Erreur lors du chargement des joueurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    socket.on('playerCreated', async (data) => {
      setPlayers((prev) => [data, ...prev])
      
      // Afficher toast
      toast.success('Nouveau joueur créé', {
        description: `${data.first_name} ${data.last_name}`
      })
      
      // Créer une notification si ce n'est pas l'utilisateur actuel qui a créé le joueur
      if (user?.id && data.created_by !== user.id) {
        try {
          await notificationService.create({
            user_id: user.id,
            type: 'info',
            priority: 'normal',
            title: '👤 Nouveau joueur dans l\'effectif',
            message: `${data.first_name} ${data.last_name} a été ajouté par un autre utilisateur`,
            link: `/players/${data.id}`
          })
        } catch (notifError) {
          console.error('Erreur création notification:', notifError)
        }
      }
    })

    socket.on('playerUpdated', (data) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === data.id ? data : p))
      )
      toast.info('Joueur mis à jour')
    })

    socket.on('playerDeleted', (data) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.id))
      toast.info('Joueur supprimé')
    })

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('playerCreated')
        socket.off('playerUpdated')
        socket.off('playerDeleted')
      }
    }
  }, [socket, user])

  return {
    players,
    loading,
    error,
    refetch: fetchPlayers,
  }
}

export const usePlayer = (id) => {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const data = await playerService.getById(id)
        setPlayer(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        toast.error('Erreur lors du chargement du joueur')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPlayer()
    }
  }, [id])

  return { player, loading, error }
}

