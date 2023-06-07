import { createContext, useState } from 'react'
import { ChildrenProp } from '../posts'
import { AuthType, AuthenticationContextType, UserProps } from '../data'
import useSwr from 'swr';
import { user_endPoint as userCache } from '../api/axiosPost';
import useGetUsers from '../hooks/useGetUsers';

export const AuthenticationProvider = createContext<AuthenticationContextType | null>(null)


export default function AuthenticationContext({ children }: ChildrenProp) {
  const { fetchUsers, getUser } = useGetUsers()
  const { data: users, isLoading, error } = useSwr<UserProps[]>(userCache, fetchUsers)
  const { data: user } = useSwr<UserProps>(userCache, getUser)
  const [auth, setAuth] = useState<AuthType>({
    _id: '', accessToken: '', roles: []
  })
  const [persistLogin, setPersistLogin] = useState<boolean>(
    JSON.parse(localStorage.getItem('persist-login') as string) as boolean || false
  )

  const value={
    auth, setAuth, persistLogin, setPersistLogin, user, users, isLoading, error
  }

  return (
    <AuthenticationProvider.Provider value={value}>
      {children}
    </AuthenticationProvider.Provider>
  )
}