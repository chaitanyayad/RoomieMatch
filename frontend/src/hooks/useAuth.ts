import { useState, useEffect, createContext, useContext } from 'react'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url: string | null
  year: number | null
  branch: string | null
  hometown: string | null
  veg_nonveg: string | null
  interests: string[]
  bio: string | null
  contact_info: string | null
  is_looking: boolean
  profile_complete: boolean
  created_at: string
}

interface AuthState {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (token: string, user: UserProfile) => void
  logout: () => void
  updateUser: (user: UserProfile) => void
}

export const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('rm_token')
    const storedUser = localStorage.getItem('rm_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('rm_token', newToken)
    localStorage.setItem('rm_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('rm_token')
    localStorage.removeItem('rm_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updated: UserProfile) => {
    localStorage.setItem('rm_user', JSON.stringify(updated))
    setUser(updated)
  }

  return { user, token, loading, login, logout, updateUser }
}
