import { createContext, useState } from 'react'
import { ChildrenProp } from '../posts'
import { AuthType, AuthenticationContextType } from '../data'

export const AuthenticationProvider = createContext<AuthenticationContextType | null>(null)

export default function AuthenticationContext({ children }: ChildrenProp) {
  const [auth, setAuth] = useState<AuthType>({
    _id: '', accessToken: '', roles: []
  })

  const value={
    auth, setAuth
  }

  return (
    <AuthenticationProvider.Provider value={value}>
      {children}
    </AuthenticationProvider.Provider>
  )
}