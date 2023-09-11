import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LeftSection } from '../components/LeftSection';
import { IsLayoutLoading } from '../components/IsLayoutLoading';
import { useNewAccessTokenMutation } from '../app/api/authApiSlice';
import { persisted, selectCurrentToken, setCredentials } from '../features/auth/authSlice';

export const PersistedLogin = () => {
  const token = useSelector(selectCurrentToken)
  const persistLogin = useSelector(persisted)
  const dispatch = useDispatch()
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
    (isMounted && !token && persistLogin) ? getNewToken() : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      isMounted = false
    }
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

 