import { Outlet } from 'react-router-dom';
import useAuthenticationContext from '../../hooks/useAuthenticationContext';
import { useEffect, useState } from 'react';
import useRefreshToken from '../../hooks/useRefreshToken';


export const PersistedLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { auth, persistLogin } = useAuthenticationContext() as AuthenticationContextType
  const getRefreshToken = useRefreshToken()
//console.log(auth)
  useEffect(() => {
    let isMounted = true
    const persistUserLogin = async() => {
      setIsLoading(true)
      try{
        await getRefreshToken()
      }
      catch(error){
        console.log('')
      }
      finally{
        isMounted && setIsLoading(false)
      }
    }
    !auth?.accessToken ? persistUserLogin() : setIsLoading(false)

    return () => {
      isMounted = false
    }
  }, [auth, getRefreshToken])

  return (
    <>
      {
        !persistLogin ? 
          <Outlet />
            :
              isLoading ? 
                <p>Loading...</p>
                  :
                  <Outlet />
      } 
    </>
  )
}
