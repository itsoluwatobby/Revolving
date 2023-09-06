import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { persisted, selectCurrentToken, setCredentials } from '../features/auth/authSlice';
import { useNewAccessTokenMutation } from '../app/api/authApiSlice';
import { AuthType } from '../data';
import { LeftSection } from '../components/LeftSection';
import { IsLayoutLoading } from '../components/IsLayoutLoading';

export const PersistedLogin = () => {
  const token = useSelector(selectCurrentToken)
  const persistLogin = useSelector(persisted)
  const dispatch = useDispatch()
  const [getNewAccessToken, { data, isLoading, isError }] = useNewAccessTokenMutation()

  useEffect(() => {
    const getNewToken = async() => {
      try{
        await getNewAccessToken()
        const res = data as unknown as {data: AuthType}
        dispatch(setCredentials({...res?.data}))
      }
      catch(err){
        console.log(err)
      }
    }
    (!token && persistLogin) ? getNewToken() : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className={`welcome flex items-center h-full`}>

      <LeftSection />

      <div className='h-full w-full md:w-full '>
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

 