import { useEffect } from "react";
import { axiosPrivate } from "../api/axiosPost";
import useAuthenticationContext from "./useAuthenticationContext";
import useRefreshToken from "./useRefreshToken";
import { AuthenticationContextType } from "../data";


export default function useAxiosPrivate() {
  const { auth } = useAuthenticationContext() as AuthenticationContextType
  const getRefreshToken = useRefreshToken()

  useEffect(() => {
    const requestInterceptors: number = axiosPrivate.interceptors.request.use(
      config => {
        if(!config.headers['Authorization']){
          config.headers['Authorization'] = `Bearer ${auth?.accessToken}`
        }
        return config
      }, (error) => Promise.reject(error)
    )

    const responseInterceptors: number = axiosPrivate.interceptors.response.use(
      response => response,
      async(error) => {
        const prevRequest = error?.config
        if(error?.response?.status == 403 && !prevRequest?.sent){
          prevRequest.sent = true;
          const newAccessToken = await getRefreshToken();
          prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return axiosPrivate(prevRequest)
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axiosPrivate.interceptors.response.eject(requestInterceptors)
      axiosPrivate.interceptors.response.eject(responseInterceptors)
    }
  }, [auth, getRefreshToken])

  return axiosPrivate
}