import { useEffect } from 'react';
import { ErrorResponse } from '../data';
import { ThemeContextType } from '../posts';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useThemeContext } from '../hooks/useThemeContext';
import { getCurrentUser } from '../features/auth/userSlice';
import { IsLayoutLoading } from '../components/IsLayoutLoading';
import useNotPersistedLogin from '../hooks/useNotPersistedLogin';
import { useNewAccessTokenMutation } from '../app/api/authApiSlice';
import { useOpenedNotificationMutation } from '../app/api/noficationSlice';
import { persisted, selectCurrentToken, setCredentials } from '../features/auth/authSlice';

export const PersistedLogin = () => {
  const dispatch = useDispatch()
  const persistLogin = useSelector(persisted)
  const token = useSelector(selectCurrentToken)
  const currentUser = useSelector(getCurrentUser)
  const notPersistedLogin = useNotPersistedLogin()
  const { setLoginPrompt, openNotification } = useThemeContext() as ThemeContextType
  const userId = localStorage.getItem('revolving_userId') as string
  const [getNewAccessToken, { isLoading, isError }] = useNewAccessTokenMutation()
  const [isNotificationOpened] = useOpenedNotificationMutation()

  
  useEffect(() => {
    let isMounted = true
    const getNewToken = async() => {
      try{
        const res = await getNewAccessToken().unwrap()
        dispatch(setCredentials({...res?.data}))
      }
      catch(err){
        const errors = err as ErrorResponse
        errors?.originalStatus == 401 ? setLoginPrompt({opened: 'Open', source: 'BadToken'}) : null
      }
    }
    if(persistLogin){
     (isMounted && !token && persistLogin) ? getNewToken() : null
    }
    else (isMounted && !token && notPersistedLogin === 'VALID') ? getNewToken() : null

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let isMounted = true
    const notificationOpen = async() => {
      try{
        const isOpen = openNotification === 'Open' ? true : false
        const stats = isOpen ? 'unread' : 'read'
        await isNotificationOpened({ isOpen, notificationId: currentUser?.notificationId as string, status: stats }).unwrap()
      }
      catch(err: unknown){
        const errors = err as ErrorResponse
        return
        // (!userId || errors?.originalStatus == 401) ? setLoginPrompt('Open') : null
      }
    }
    if(isMounted && userId) notificationOpen()

    return () => {
      isMounted = false
    }
  }, [openNotification, isNotificationOpened, setLoginPrompt, currentUser?.notificationId, userId])

  return (
    <main className={`welcome w-full h-full`}>
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
    </main>
  )
}

 