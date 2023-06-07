import { Outlet, useNavigate } from 'react-router-dom';
import useAuthenticationContext from '../hooks/useAuthenticationContext';
import { useEffect, useState } from 'react';
import useRefreshToken from '../hooks/useRefreshToken';
import darkBGloader from '../assets/darkLoader.svg'
import whiteBGloader from '../assets/whiteloader.svg'
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';
import { toast } from 'react-hot-toast';
import useLogout from '../hooks/useLogout';
import { AuthenticationContextType } from '../data';

export const PersistedLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { auth, persistLogin } = useAuthenticationContext() as AuthenticationContextType
  const getRefreshToken = useRefreshToken()
  const userId = localStorage.getItem('revolving_userId')
  const { theme } = useThemeContext() as ThemeContextType
  const navigate = useNavigate()
  const signOut = useLogout()

  useEffect(() => {
    let isMounted = true
    const persistUserLogin = async() => {
      if(userId != null){
        setIsLoading(true)
        try{
          await getRefreshToken()
        }
        catch(error){
          signOut('use')
          const errors = error as {response:{status:number}}
          errors?.response?.status == 401
          toast.error('Session Ended!', {
            duration: 10000, icon: '💀', style: { background: '#FA2B50'}
          })
          navigate('/signIn', {replace: true})
        }
        finally{
          isMounted && setIsLoading(false)
        }
      }
      return
    }
    !auth?.accessToken ? persistUserLogin() : setIsLoading(false)

    return () => {
      isMounted = false
    }
  }, [auth, getRefreshToken, navigate, signOut, userId])

  return (
    <>
      {
        !persistLogin ? 
          <Outlet />
            :
              isLoading ? 
                  (theme == 'light' ?
                      <figure className='border-none'>
                        <img src={whiteBGloader} 
                          alt="Loading..." 
                          className='bg-inherit border-none m-auto translate-y-40'
                        />
                      </figure>
                      :
                      <figure className='border-none'>
                        <img src={darkBGloader} 
                          alt="Loading..." 
                          className='bg-inherit border-none m-auto translate-y-40'
                        />
                      </figure>
                    )
                  :
                  <Outlet />
      } 
    </>
  )
}
