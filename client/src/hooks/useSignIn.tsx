import { axiosAuth } from '../api/axiosPost'
import { ThemeContextType } from '../posts'
import { useThemeContext } from './useThemeContext'

type UserPropType={
  username?: string, email: string, password: string
}

export default function useSignIn(user: UserPropType) {
  const { setRollout } = useThemeContext() as ThemeContextType

  const signUserIn = async(): Promise<AuthType> => {
    const res = await axiosAuth.post('/login', {
      email: user?.email, password: user?.password
    })
    setRollout(false)
    return res?.data 
  }
  return signUserIn
}