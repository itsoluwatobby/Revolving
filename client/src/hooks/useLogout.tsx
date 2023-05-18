import { toast } from "react-hot-toast"
import { axiosAuth } from "../api/axiosPost"
import useAuthenticationContext from "./useAuthenticationContext"
import { useNavigate } from "react-router-dom"
import { useThemeContext } from "./useThemeContext"
import { ThemeContextType } from "../posts"

export default function useLogout() {
  const { auth, setAuth } = useAuthenticationContext() as AuthenticationContextType
  const { setRollout } = useThemeContext() as ThemeContextType
  const navigate = useNavigate()

  const signOut = async() => {
    try{
      await axiosAuth.get(`/logout/${auth?._id}`)
      setAuth({_id: '', accessToken: '', roles: []})
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      setRollout(false)
      localStorage.removeItem('newStoryInputValue')
      localStorage.removeItem('newStoryTextareaValue')

      localStorage.removeItem('editStoryInputValue')
      localStorage.removeItem('editStoryTextareaValue')
      navigate('/signIn', { replace: true })
    }catch(err){
      setAuth({_id: '', accessToken: '', roles: []})
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      localStorage.removeItem('newStoryInputValue')
      localStorage.removeItem('newStoryTextareaValue')

      localStorage.removeItem('editStoryInputValue')
      localStorage.removeItem('editStoryTextareaValue')
      navigate('/signIn', {replace: true})
    }
  }

  return signOut
}