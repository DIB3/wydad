import { useState, useEffect, useCallback } from 'react'
import examenMedicalService from '../services/examenMedical.service'

export function useExamenMedical(visitId) {
  const [examenMedical, setExamenMedical] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExamenMedical = useCallback(async () => {
    if (!visitId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await examenMedicalService.getByVisitId(visitId)
      setExamenMedical(data)
      setError(null)
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message)
      }
      setExamenMedical(null)
    } finally {
      setLoading(false)
    }
  }, [visitId])

  useEffect(() => {
    fetchExamenMedical()
  }, [fetchExamenMedical])

  const refresh = () => {
    fetchExamenMedical()
  }

  return { examenMedical, loading, error, refresh }
}

export function usePlayerExamensMedicaux(playerId) {
  const [examensMedicaux, setExamensMedicaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlayerExamensMedicaux = useCallback(async () => {
    if (!playerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await examenMedicalService.getByPlayerId(playerId)
      setExamensMedicaux(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setExamensMedicaux([])
    } finally {
      setLoading(false)
    }
  }, [playerId])

  useEffect(() => {
    fetchPlayerExamensMedicaux()
  }, [fetchPlayerExamensMedicaux])

  const refresh = () => {
    fetchPlayerExamensMedicaux()
  }

  return { examensMedicaux, loading, error, refresh }
}

export function useAllExamensMedicaux() {
  const [examensMedicaux, setExamensMedicaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAllExamensMedicaux = useCallback(async () => {
    try {
      setLoading(true)
      const data = await examenMedicalService.getAll()
      setExamensMedicaux(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setExamensMedicaux([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllExamensMedicaux()
  }, [fetchAllExamensMedicaux])

  const refresh = () => {
    fetchAllExamensMedicaux()
  }

  return { examensMedicaux, loading, error, refresh }
}

