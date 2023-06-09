import { axiosAuth } from "../api/axiosPost"
import useAuthenticationContext from "./useAuthenticationContext"
import useLogout from "./useLogout"
import { AuthenticationContextType, ErrorResponse } from "../data"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

type ResponseType={
  data: { 
    data: {
      accessToken: string 
    }
  }
}

export default function useRefreshToken() {
  const { auth, setAuth } = useAuthenticationContext() as AuthenticationContextType
  const signOut = useLogout()
  const navigate = useNavigate()

  const getRefreshToken = async() => {
    try{
      const response = await axiosAuth('/new_access_token') as ResponseType
      setAuth(prev => ({...prev, ...response?.data?.data}))
      return response?.data?.data?.accessToken
    }
    catch(error){
      let errorMessage = '';
      const errors = error as ErrorResponse
      errors?.response?.status === 401 ? signOut('use')
        : errors?.response?.status === 404 ? errorMessage = 'Bad credentials' 
          : errors?.response?.status === 403 ? errorMessage = 'Session ended, please login' 
            : errors?.response?.status === 500 ? 'Internal Server Error' : signOut('use')
      toast.error('No Network Connection', {
        duration: 10000, icon: '💀', style: { background: '#FA2B50'}
      })
      // navigate('/signIn', {replace: true})
    }
  }
  return getRefreshToken
}