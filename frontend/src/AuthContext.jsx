import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api, clearAuth, loadAuth, saveAuth } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth())

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password)
    saveAuth(data)
    setAuth(data)
  }, [])

  const register = useCallback(
    async (email, password) => {
      await api.register(email, password)
      await login(email, password)
    },
    [login],
  )

  const logout = useCallback(() => {
    clearAuth()
    setAuth(null)
  }, [])

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      isAdmin: auth?.user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [auth, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}