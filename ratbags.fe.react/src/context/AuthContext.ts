import { createContext } from 'react'

export interface AuthenticatedUser {
  id: string
  firstName: string
  lastName: string
}

export interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  user: AuthenticatedUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
