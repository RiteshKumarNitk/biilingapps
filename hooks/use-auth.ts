'use client'

import { useState, useCallback } from 'react'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  
  const login = useCallback(async (token: string, userData: any) => {
    setUser(userData)
    // Here we'd typically store the token in localStorage or context
  }, [])
  
  const logout = useCallback(async () => {
    setUser(null)
    // Clear tokens
  }, [])

  return { user, login, logout, isAuthenticated: !!user }
}
