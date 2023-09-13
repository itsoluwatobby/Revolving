import { toast } from "react-hot-toast"
import { ThemeContextType } from "../posts"
import { useThemeContext } from "./useThemeContext"
import { useDispatch } from "react-redux"
import { signUserOut } from "../features/auth/authSlice"
import { useLocation, useNavigate } from "react-router-dom"
import { useSignOutMutation } from "../app/api/authApiSlice"

type SignOutType = 'dont' | 'use'

export default function useLogout() {
  const { setRollout } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [signedOut] = useSignOutMutation()
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const signOut = async(option: SignOutType = 'use') => {
    try{
      if(currentUserId) await signedOut(currentUserId as string)
      dispatch(signUserOut())
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      setRollout(false)
      if(option === 'use') navigate('/signIn', { state: pathname })
      else if(option === 'dont'){
        localStorage.clear()
        navigate('/signIn')
      }
    }catch(err){
      dispatch(signUserOut())
      setRollout(false)
      if(option === 'use') navigate('/signIn', { state: pathname })
      else if(option === 'dont'){
        localStorage.clear()
        navigate('/signIn')
      }
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
    }
  }
  return signOut
}

// function clearStorage(userId: string, languages: string[]){
//   localStorage.removeItem(`newTitle?id=${userId}`)
//   localStorage.removeItem(`newBody?id=${userId}`)
//   languages.map(language => {
//     localStorage.removeItem(`revolving-${language}`)
//   })
//   // localStorage.removeItem('revolving-codeStore')

//   localStorage.removeItem(`editTitle?id=${userId}`)
//   localStorage.removeItem(`editBody?id=${userId}`)
//   localStorage.removeItem('revolving_login_time')
//   localStorage.removeItem('revolving_userId')
//   localStorage.removeItem('revolving-languageName')
// }