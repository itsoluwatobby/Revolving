import { axiosAuth } from '../api/axiosPost'
import { ThemeContextType } from '../posts'
import { useThemeContext } from './useThemeContext'

type UserPropType={
  username?: string, email: string, password: string
}

export default function useSignUp(user: UserPropType) {
  const { setRollout } = useThemeContext() as ThemeContextType

  const signUpUser = async(): Promise<void> => {
    const res = await axiosAuth.post('/registration', {
      username: user?.username ,email: user?.email, password: user?.password
    })
    setRollout(false)
    return res?.data?.data
  }
  //type AuthFetcher = Awaited<ReturnType<typeof signUpUser>>
  
  return signUpUser
}

