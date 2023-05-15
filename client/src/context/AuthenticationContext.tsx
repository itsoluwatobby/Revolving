import { createContext, useState } from 'react'
import { ChildrenProp } from '../posts'

export const AuthenticationProvider = createContext<AuthenticationContextType | null>(null)


export default function AuthenticationContext({ children }: ChildrenProp) {
  const [auth, setAuth] = useState<AuthType>({
    _id: '', accessToken: '', roles: []
  })
  const [persistLogin, setPersistLogin] = useState<boolean>(
    JSON.parse(localStorage.getItem('persist-login') as string) as boolean || false
  )

  const value={
    auth, setAuth, persistLogin, setPersistLogin
  }

  return (
    <AuthenticationProvider.Provider value={value}>
      {children}
    </AuthenticationProvider.Provider>
  )
}