import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { apiAuth } from '../services/apiClient'

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SingInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  singIn(credentials: SingInCredentials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
}

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
  destroyCookie(undefined, 'dashgo.token')
  destroyCookie(undefined, 'dashgo.refreshToken')

  Router.push('/')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'dashgo.token': token } = parseCookies()

    if (token) {
      apiAuth.get('/me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({ email, permissions, roles })

      }).catch(() => {
        signOut();
      })
    }

  }, [])

  async function singIn({ email, password }: SingInCredentials) {

    try {
      const response = await apiAuth.post('/sessions', {
        email, password
      })

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'dashgo.token', token, {
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: '/'
      })
      setCookie(undefined, 'dashgo.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      apiAuth.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')
    } catch (err) {
      console.log(err);
    }

  }

  return (
    <AuthContext.Provider value={{ singIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}