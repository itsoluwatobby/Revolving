import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LeftSection } from '../components/LeftSection';
import { IsLayoutLoading } from '../components/IsLayoutLoading';
import useNotPersistedLogin from '../hooks/useNotPersistedLogin';
import { useNewAccessTokenMutation } from '../app/api/authApiSlice';
import { persisted, selectCurrentToken, setCredentials } from '../features/auth/authSlice';

export const PersistedLogin = () => {
  const dispatch = useDispatch()
  const token = useSelector(selectCurrentToken)
  const persistLogin = useSelector(persisted)
  const notPersistedLogin = useNotPersistedLogin()
  const [getNewAccessToken, { isLoading, isError }] = useNewAccessTokenMutation()

  useEffect(() => {
    let isMounted = true
    const getNewToken = async() => {
      try{
        const res = await getNewAccessToken().unwrap()
        dispatch(setCredentials({...res?.data}))
      }
      catch(err){
        console.log(err)
      }
    }
    if(persistLogin)
     (isMounted && !token && persistLogin) ? getNewToken() : null
    else (isMounted && !token && notPersistedLogin === 'VALID') ? getNewToken() : null

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className={`welcome flex items-center h-full`}>

      <LeftSection />

      <div className='h-full w-full md:w-full'>
        {
          !token ? 
            <Outlet />
            :
            isLoading ?  
              <IsLayoutLoading />
            :
            (
              (!persistLogin && token) ? 
                <Outlet />
                :
              (token && persistLogin) ? 
                <Outlet />
                  : isError && <Navigate to='/signIn' state={{ from: location }} replace />
            )
        }
      </div>

    </main>
  )
}

 