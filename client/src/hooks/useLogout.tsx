import { toast } from "react-hot-toast"
import { axiosAuth } from "../api/axiosPost"
import useAuthenticationContext from "./useAuthenticationContext"
import { useNavigate } from "react-router-dom"
import { useThemeContext } from "./useThemeContext"
import { ThemeContextType } from "../posts"
import { AuthenticationContextType } from "../data"

type SignOutType = 'dont' | 'use'

export default function useLogout() {
  const { setAuth } = useAuthenticationContext() as AuthenticationContextType
  const { setRollout } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId')
  const navigate = useNavigate()

  const signOut = async(option: SignOutType = 'use') => {
    try{
      await axiosAuth.get(`/logout`)
      setAuth({_id: '', accessToken: '', roles: []})
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      setRollout(false)
      localStorage.removeItem(`newTitle?id=${currentUserId}`)
      localStorage.removeItem(`newBody?id=${currentUserId}`)

      localStorage.removeItem(`editTitle?id=${currentUserId}`)
      localStorage.removeItem(`editBody?id=${currentUserId}`)
      localStorage.removeItem('revolving_userId')
      option == 'use' ? navigate('/signIn', { replace: true }) : null
    }catch(err){
      setAuth({_id: '', accessToken: '', roles: []})
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      localStorage.removeItem(`newTitle?id=${currentUserId}`)
      localStorage.removeItem(`newBody?id=${currentUserId}`)

      localStorage.removeItem(`editTitle?id=${currentUserId}`)
      localStorage.removeItem(`editBody?id=${currentUserId}`)
      localStorage.removeItem('revolving_userId')
      option == 'use' ? navigate('/signIn', { replace: true }) : null
    }
  }

  return signOut
}