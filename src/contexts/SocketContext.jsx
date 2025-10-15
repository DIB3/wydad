import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8000'
    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [isAuthenticated])

  const joinPlayerRoom = (playerId) => {
    if (socket && connected) {
      socket.emit('joinPlayer', playerId)
    }
  }

  const leavePlayerRoom = (playerId) => {
    if (socket && connected) {
      socket.emit('leavePlayer', playerId)
    }
  }

  const value = {
    socket,
    connected,
    joinPlayerRoom,
    leavePlayerRoom,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

