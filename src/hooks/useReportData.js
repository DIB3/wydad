import { useState, useEffect, useCallback } from 'react'
import reportService from '../services/report.service'
import { useSocket } from '../contexts/SocketContext'

export function useReportData(playerId = null, startDate = null, endDate = null) {
  const [stats, setStats] = useState(null)
  const [visitsEvolution, setVisitsEvolution] = useState([])
  const [visitsByModule, setVisitsByModule] = useState([])
  const [statusDistribution, setStatusDistribution] = useState([])
  const [injuriesEvolution, setInjuriesEvolution] = useState([])
  const [impedanceData, setImpedanceData] = useState([])
  const [gpsData, setGPSData] = useState([])
  const [averageIMC, setAverageIMC] = useState([])
  const [performanceRadar, setPerformanceRadar] = useState([])
  const [certificatesExpiry, setCertificatesExpiry] = useState([])
  const [recentVisits, setRecentVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const socket = useSocket()

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Récupérer toutes les données de base en parallèle
      const [
        statsData,
        visitsEvolutionData,
        visitsByModuleData,
        statusDistributionData,
        injuriesEvolutionData,
        averageIMCData,
        performanceRadarData,
        certificatesExpiryData,
        recentVisitsData
      ] = await Promise.all([
        reportService.getStats(playerId, startDate, endDate),
        reportService.getVisitsEvolution(playerId, 6),
        reportService.getVisitsByModule(playerId, startDate, endDate),
        reportService.getStatusDistribution(playerId),
        reportService.getInjuriesEvolution(playerId, 6),
        reportService.getAverageIMC(playerId, 6),
        reportService.getPerformanceRadar(playerId),
        reportService.getCertificatesExpiry(playerId),
        reportService.getRecentVisits(playerId, 5)
      ])

      setStats(statsData)
      setVisitsEvolution(visitsEvolutionData)
      setVisitsByModule(visitsByModuleData)
      setStatusDistribution(statusDistributionData)
      setInjuriesEvolution(injuriesEvolutionData)
      setAverageIMC(averageIMCData)
      setPerformanceRadar(performanceRadarData)
      setCertificatesExpiry(certificatesExpiryData)
      setRecentVisits(recentVisitsData)

      // Récupérer les données GPS et Impédance (moyenne tous joueurs ou joueur spécifique)
      try {
        const [impedance, gps] = await Promise.all([
          reportService.getImpedanceData(playerId, 6),
          reportService.getGPSData(playerId, 8)
        ])
        setImpedanceData(impedance)
        setGPSData(gps)
      } catch (err) {
        // Les données peuvent ne pas être disponibles
        console.warn('Données GPS/Impédance non disponibles:', err.message)
        setImpedanceData([])
        setGPSData([])
      }
    } catch (err) {
      console.error('Erreur lors du chargement des rapports:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [playerId, startDate, endDate])

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Écouter les événements Socket.IO pour mise à jour en temps réel
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    const handleUpdate = () => {
      fetchAllData()
    }

    // Écouter tous les événements qui impactent les rapports
    socket.on('playerCreated', handleUpdate)
    socket.on('playerUpdated', handleUpdate)
    socket.on('playerDeleted', handleUpdate)
    socket.on('visitCreated', handleUpdate)
    socket.on('visitUpdated', handleUpdate)
    socket.on('visitDeleted', handleUpdate)
    socket.on('certificateCreated', handleUpdate)
    socket.on('certificateUpdated', handleUpdate)
    socket.on('visit_pcmaCreated', handleUpdate)
    socket.on('visit_impedanceCreated', handleUpdate)
    socket.on('visit_gpsCreated', handleUpdate)
    socket.on('visit_injuriesCreated', handleUpdate)
    socket.on('visit_nutritionCreated', handleUpdate)
    socket.on('visit_careCreated', handleUpdate)

    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('playerCreated', handleUpdate)
        socket.off('playerUpdated', handleUpdate)
        socket.off('playerDeleted', handleUpdate)
        socket.off('visitCreated', handleUpdate)
        socket.off('visitUpdated', handleUpdate)
        socket.off('visitDeleted', handleUpdate)
        socket.off('certificateCreated', handleUpdate)
        socket.off('certificateUpdated', handleUpdate)
        socket.off('visit_pcmaCreated', handleUpdate)
        socket.off('visit_impedanceCreated', handleUpdate)
        socket.off('visit_gpsCreated', handleUpdate)
        socket.off('visit_injuriesCreated', handleUpdate)
        socket.off('visit_nutritionCreated', handleUpdate)
        socket.off('visit_careCreated', handleUpdate)
      }
    }
  }, [socket, fetchAllData])

  return {
    stats,
    visitsEvolution,
    visitsByModule,
    statusDistribution,
    injuriesEvolution,
    impedanceData,
    gpsData,
    averageIMC,
    performanceRadar,
    certificatesExpiry,
    recentVisits,
    loading,
    error,
    refetch: fetchAllData
  }
}

