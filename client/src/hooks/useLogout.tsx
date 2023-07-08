import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useThemeContext } from "./useThemeContext"
import { ThemeContextType } from "../posts"
import { useSignOutMutation } from "../app/api/authApiSlice"
import { useDispatch, useSelector } from "react-redux"
import { signUserOut } from "../features/auth/authSlice"
import { getLanguages } from "../features/story/codeSlice"

type SignOutType = 'dont' | 'use'

export default function useLogout() {
  const { setRollout } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId')
  const [signedOut] = useSignOutMutation()
  const languages = useSelector(getLanguages)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const signOut = async(option: SignOutType = 'use') => {
    try{
      await signedOut(currentUserId as string)
      dispatch(signUserOut())
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      setRollout(false)
      clearStorage(currentUserId as string, languages)
      option == 'use' ? navigate('/signIn', { replace: true }) : null
    }catch(err){
      // const errors = error as ErrorResponse
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      clearStorage(currentUserId as string, languages)
      option == 'use' ? navigate('/signIn', { replace: true }) : null
    }
  }

  return signOut
}

function clearStorage(userId: string, languages: string[]){
  localStorage.removeItem(`newTitle?id=${userId}`)
  localStorage.removeItem(`newBody?id=${userId}`)
  languages.map(language => {
    localStorage.removeItem(`revolving-${language}`)
  })
  // localStorage.removeItem('revolving-codeStore')

  localStorage.removeItem(`editTitle?id=${userId}`)
  localStorage.removeItem(`editBody?id=${userId}`)
  localStorage.removeItem('revolving_userId')
  localStorage.removeItem('revolving-languageName')
}