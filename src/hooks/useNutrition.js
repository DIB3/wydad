import { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import nutritionService from '../services/nutrition.service'
import { toast } from 'sonner'

export const useNutrition = (visitId) => {
  const [nutrition, setNutrition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket } = useSocket()

  const fetchNutrition = async () => {
    if (!visitId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await nutritionService.getByVisitId(visitId)
      setNutrition(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      if (err.response?.status !== 404) {
        toast.error('Erreur lors du chargement de la nutrition')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNutrition()
  }, [visitId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket) return

    socket.on('visit_nutritionCreated', (data) => {
      if (data.visit_id === visitId) {
        setNutrition(data)
        toast.success('Nutrition créée')
      }
    })

    socket.on('visit_nutritionUpdated', (data) => {
      if (data.visit_id === visitId) {
        setNutrition(data)
        toast.info('Nutrition mise à jour')
      }
    })

    socket.on('visit_nutritionDeleted', (data) => {
      if (data.id === visitId) {
        setNutrition(null)
        toast.info('Nutrition supprimée')
      }
    })

    return () => {
      socket.off('visit_nutritionCreated')
      socket.off('visit_nutritionUpdated')
      socket.off('visit_nutritionDeleted')
    }
  }, [socket, visitId])

  return {
    nutrition,
    loading,
    error,
    refetch: fetchNutrition,
  }
}

export const usePlayerNutrition = (playerId) => {
  const [nutritionList, setNutritionList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const { socket } = useSocket()

  const fetchPlayerNutrition = async () => {
    if (!playerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await nutritionService.getByPlayerId(playerId)
      setNutritionList(data)
      
      // Calculer les statistiques
      const playerStats = await nutritionService.getPlayerNutritionStats(playerId)
      setStats(playerStats)
      
      setError(null)
    } catch (err) {
      // Ne pas afficher de toast pour les erreurs 404 (données non trouvées = normal)
      if (err.response?.status !== 404) {
        setError(err.message)
        toast.error('Erreur lors du chargement des plans nutrition du joueur')
      } else {
        // 404 = pas de données, c'est normal
        setNutritionList([])
        setStats(null)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayerNutrition()
  }, [playerId])

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket || !playerId) return

    socket.on('visit_nutritionCreated', (data) => {
      // Vérifier que la nutrition appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setNutritionList((prev) => [data, ...prev])
        toast.success('Nouveau plan nutrition créé')
        // Recalculer les stats
        fetchPlayerNutrition()
      }
    })

    socket.on('visit_nutritionUpdated', (data) => {
      // Vérifier que la nutrition appartient au joueur actuel
      if (data.visit?.player_id === playerId || data.player_id === playerId) {
        setNutritionList((prev) =>
          prev.map((n) => (n.visit_id === data.visit_id ? data : n))
        )
        toast.info('Plan nutrition mis à jour')
        // Recalculer les stats
        fetchPlayerNutrition()
      }
    })

    socket.on('visit_nutritionDeleted', (data) => {
      setNutritionList((prev) => prev.filter((n) => n.visit_id !== data.id))
      toast.info('Plan nutrition supprimé')
      // Recalculer les stats
      fetchPlayerNutrition()
    })

    return () => {
      socket.off('visit_nutritionCreated')
      socket.off('visit_nutritionUpdated')
      socket.off('visit_nutritionDeleted')
    }
  }, [socket, playerId])

  return {
    nutritionList,
    stats,
    loading,
    error,
    refetch: fetchPlayerNutrition,
  }
}

