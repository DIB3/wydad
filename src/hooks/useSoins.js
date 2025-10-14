import { useState, useEffect, useCallback } from 'react'
import soinsService from '../services/soins.service'

export function useSoins(visitId) {
  const [soin, setSoin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSoin = useCallback(async () => {
    if (!visitId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await soinsService.getByVisitId(visitId)
      setSoin(data)
      setError(null)
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message)
      }
      setSoin(null)
    } finally {
      setLoading(false)
    }
  }, [visitId])

  useEffect(() => {
    fetchSoin()
  }, [fetchSoin])

  const refresh = () => {
    fetchSoin()
  }

  return { soin, loading, error, refresh }
}

export function usePlayerSoins(playerId) {
  const [soinsList, setSoinsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlayerSoins = useCallback(async () => {
    if (!playerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await soinsService.getByPlayerId(playerId)
      setSoinsList(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setSoinsList([])
    } finally {
      setLoading(false)
    }
  }, [playerId])

  useEffect(() => {
    fetchPlayerSoins()
  }, [fetchPlayerSoins])

  const refresh = () => {
    fetchPlayerSoins()
  }

  return { soinsList, loading, error, refresh }
}

export function useBlessureSoins(blessureId) {
  const [soinsList, setSoinsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBlessureSoins = useCallback(async () => {
    if (!blessureId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await soinsService.getByBlessureId(blessureId)
      setSoinsList(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setSoinsList([])
    } finally {
      setLoading(false)
    }
  }, [blessureId])

  useEffect(() => {
    fetchBlessureSoins()
  }, [fetchBlessureSoins])

  const refresh = () => {
    fetchBlessureSoins()
  }

  return { soinsList, loading, error, refresh }
}

export function useAllSoins() {
  const [soinsList, setSoinsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAllSoins = useCallback(async () => {
    try {
      setLoading(true)
      const data = await soinsService.getAll()
      setSoinsList(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setSoinsList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllSoins()
  }, [fetchAllSoins])

  const refresh = () => {
    fetchAllSoins()
  }

  return { soinsList, loading, error, refresh }
}

