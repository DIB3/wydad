import React, { createContext, useState, useContext, useEffect } from 'react'
import authService from '../services/auth.service'
import { toast } from 'sonner'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      setUser(data.user)
      toast.success('Connexion réussie!')
      return data
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur de connexion'
      console.error('Erreur de connexion:', errorMessage, error.response?.data)
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const data = await authService.register(userData)
      toast.success('Inscription réussie! Vous pouvez maintenant vous connecter.')
      return data
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Erreur lors de l'inscription"
      console.error("Erreur d'inscription:", errorMessage, error.response?.data)
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    toast.info('Déconnexion réussie')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

