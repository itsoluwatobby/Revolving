import { toast } from "react-hot-toast"
import { axiosAuth } from "../api/axiosPost"
import useAuthenticationContext from "./useAuthenticationContext"
import { useNavigate } from "react-router-dom"

export default function useLogout() {
  const { auth, setAuth } = useAuthenticationContext() as AuthenticationContextType
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
      navigate('/signIn', { replace: true })
    }catch(err){
      setAuth({_id: '', accessToken: '', roles: []})
      toast.success('Success!! You logged out', {
        duration: 2000, icon: '👋', style: {
          background: '#8FBC8F'
        }
      })
      navigate('/signIn')
    }
  }

  return signOut
}