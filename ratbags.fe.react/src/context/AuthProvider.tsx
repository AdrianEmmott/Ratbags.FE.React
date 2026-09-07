import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { login as loginRequest, refreshToken as refreshTokenRequest } from '../api/accounts'
import { AuthContext } from './AuthContext'
import type { AuthenticatedUser } from './AuthContext'
import { decodeJwtPayload } from '../utils/jwt'

const STORAGE_KEY = 'jwt'
// refresh this long before the JWT actually expires, so an in-flight
// request never races the exact expiry instant
const REFRESH_BUFFER_MS = 60_000

interface JwtPayload {
  sub?: string
  exp?: number
  given_name?: string
  family_name?: string
}

function getUserFromToken(token: string | null): AuthenticatedUser | null {
  if (!token) return null

  const payload = decodeJwtPayload<JwtPayload>(token)
  if (!payload?.sub) return null

  return {
    id: payload.sub,
    firstName: payload.given_name ?? '',
    lastName: payload.family_name ?? '',
  }
}

function getExpiryMs(token: string | null): number | null {
  if (!token) return null

  const payload = decodeJwtPayload<JwtPayload>(token)
  return payload?.exp ? payload.exp * 1000 : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  )

  const login = async (email: string, password: string) => {
    const { jwt } = await loginRequest({ email, password })
    localStorage.setItem(STORAGE_KEY, jwt)
    setToken(jwt)
  }

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [])

  const user = useMemo(() => getUserFromToken(token), [token])

  // silently exchange the JWT for a new one shortly before it expires, using
  // the refresh token cookie set at login - keeps a long editing session from
  // getting booted mid-save. falls back to logging out if the refresh fails
  // (e.g. the refresh token itself has expired or been revoked).
  useEffect(() => {
    if (!token || !user) {
      return
    }

    const expiryMs = getExpiryMs(token)
    if (!expiryMs) {
      return
    }

    const delay = Math.max(expiryMs - Date.now() - REFRESH_BUFFER_MS, 0)

    const timer = window.setTimeout(() => {
      refreshTokenRequest(user.id)
        .then(({ jwt }) => {
          localStorage.setItem(STORAGE_KEY, jwt)
          setToken(jwt)
        })
        .catch(() => {
          logout()
        })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [token, user, logout])

  const value = useMemo(
    () => ({ token, isAuthenticated: token !== null, user, login, logout }),
    [token, user, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
