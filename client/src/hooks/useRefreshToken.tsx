import { toast } from "react-hot-toast"
import { axiosAuth } from "../api/axiosPost"
import useAuthenticationContext from "./useAuthenticationContext"
import useLogout from "./useLogout"

type ResponseType={
  data: { accessToken: string }
}

export default function useRefreshToken() {
  const { setAuth } = useAuthenticationContext() as AuthenticationContextType
  const signOut = useLogout()

  const getRefreshToken = async() => {
    try{
      const response = await axiosAuth('/new_access_token') as ResponseType
      setAuth(prev => ({...prev, accessToken: response?.data?.accessToken}))
      return response?.data?.accessToken
    }
    catch(error){
      let errorMessage;
      const errors = error as ErrorResponse
      errors?.response?.status === 401 ? errorMessage = 'unauthorized' 
        : errors?.response?.status === 404 ? errorMessage = 'Bad credentials' 
          : errors?.response?.status === 403 ? errorMessage = 'Session ended, please login' 
            : errors?.response?.status === 500 ? errorMessage = 'Internal server error' : errorMessage = 'No network'
      
        toast.error(`${errorMessage}`, {
          duration: 3000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
      signOut()
    }
  }
  return getRefreshToken
}