import { Outlet, useNavigate } from 'react-router-dom';
import useAuthenticationContext from '../hooks/useAuthenticationContext';
import { useEffect, useState } from 'react';
import useRefreshToken from '../hooks/useRefreshToken';
import darkBGloader from '../../assets/darkLoader.svg'
import whiteBGloader from '../../assets/whiteloader.svg'
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
  const [retries, setRetries] = useState<number>(0);
  const signOut = useLogout()

  useEffect(() => {
    let isMounted = true
    const persistUserLogin = async() => {
      setIsLoading(true)
      try{
        setRetries(prev => prev + 1)
        await getRefreshToken()
      }
      catch(error){
        const errors = error as {response:{status:number}}
        if(retries == 5){
          errors?.response?.status == 401 && signOut('dont')
          toast.error('bad credentials!', {
            duration: 4000, icon: '💀', style: { background: '#FA2B50'}
          })
          setRetries(0)
          navigate('/signIn', {replace: true})
        }
      }
      finally{
        isMounted && setIsLoading(false)
      }
    }
    (!auth?.accessToken && userId) ? persistUserLogin() : setIsLoading(false)

    return () => {
      isMounted = false
    }
  }, [auth, getRefreshToken, navigate, signOut, userId, retries])

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
