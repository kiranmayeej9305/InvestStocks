'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  plan: string
  role?: 'user' | 'admin'
  phone?: string
  location?: string
  joinDate?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/status')
      const data = await response.json()

      if (data.authenticated && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
        // Update localStorage for backwards compatibility
        localStorage.setItem('StokAlert_user', JSON.stringify(data.user))
        localStorage.setItem('StokAlert_authenticated', 'true')
        localStorage.setItem('StokAlert_session_timestamp', Date.now().toString())
      } else {
        setUser(null)
        setIsAuthenticated(false)
        // Clear localStorage
        localStorage.removeItem('StokAlert_user')
        localStorage.removeItem('StokAlert_authenticated')
        localStorage.removeItem('StokAlert_session_timestamp')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      setIsAuthenticated(true)
      
      // Update localStorage
      localStorage.setItem('StokAlert_user', JSON.stringify(data.user))
      localStorage.setItem('StokAlert_authenticated', 'true')
      localStorage.setItem('StokAlert_session_timestamp', Date.now().toString())

      // Redirect to dashboard
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setUser(data.user)
      setIsAuthenticated(true)
      
      // Update localStorage
      localStorage.setItem('StokAlert_user', JSON.stringify(data.user))
      localStorage.setItem('StokAlert_authenticated', 'true')
      localStorage.setItem('StokAlert_session_timestamp', Date.now().toString())

      // Redirect to dashboard
      router.push('/')
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      setUser(null)
      setIsAuthenticated(false)
      
      // Clear localStorage
      localStorage.removeItem('StokAlert_user')
      localStorage.removeItem('StokAlert_authenticated')
      localStorage.removeItem('StokAlert_session_timestamp')

      // Redirect to main page
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  // Must call useContext unconditionally (Rules of Hooks)
  const context = useContext(AuthContext)
  
  // Return default values if context is undefined (SSR or outside provider)
  if (context === undefined) {
    // On client side, if context is not available, return safe defaults instead of throwing
    // This can happen during initial render before AuthProvider is mounted
    console.warn('useAuth called outside AuthProvider, returning default values')
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
      checkAuth: async () => {},
    }
  }
  
  return context
}

