import { Outlet } from 'react-router-dom';
import useAuthenticationContext from '../../hooks/useAuthenticationContext';
import { useEffect, useState } from 'react';
import useRefreshToken from '../../hooks/useRefreshToken';
import darkBGloader from '../../assets/darkLoader.svg'
import whiteBGloader from '../../assets/whiteloader.svg'
import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';
import { toast } from 'react-hot-toast';
import useLogout from '../../hooks/useLogout';
import { AuthenticationContextType } from '../../data';


export const PersistedLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { auth, persistLogin } = useAuthenticationContext() as AuthenticationContextType
  const getRefreshToken = useRefreshToken()
  const userId = localStorage.getItem('revolving_userId')
  const { theme } = useThemeContext() as ThemeContextType
  //const [retries, setRetries] = useState<number>(0);
  const signOut = useLogout()
//console.log(retries)
  useEffect(() => {
    let isMounted = true
    const persistUserLogin = async() => {
      setIsLoading(true)
      //setRetries(prev => prev + 1)
      try{
        await getRefreshToken()
      }
      catch(error){
        signOut()
        toast.error('bad credentials!', {
          duration: 4000, icon: '💀', style: { background: '#FA2B50'}
        })
      }
      finally{
        isMounted && setIsLoading(false)
      }
    }
    (userId && !auth?.accessToken) ? persistUserLogin() : setIsLoading(false)

    return () => {
      isMounted = false
    }
  }, [auth, getRefreshToken, signOut, userId])

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
