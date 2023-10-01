import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../features/auth/userSlice';
import { IsLayoutLoading } from '../components/IsLayoutLoading';
import useNotPersistedLogin from '../hooks/useNotPersistedLogin';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useNewAccessTokenMutation } from '../app/api/authApiSlice';
import { useOpenedNotificationMutation } from '../app/api/noficationSlice';
import { persisted, selectCurrentToken, setCredentials } from '../features/auth/authSlice';
import { ErrorResponse } from '../data';
import toast from 'react-hot-toast';
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';

export const PersistedLogin = () => {
  const dispatch = useDispatch()
  const { pathname } =  useLocation()
  const persistLogin = useSelector(persisted)
  const token = useSelector(selectCurrentToken)
  const currentUser = useSelector(getCurrentUser)
  const notPersistedLogin = useNotPersistedLogin()
  const { setLoginPrompt } = useThemeContext() as ThemeContextType
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

  useEffect(() => {
    let isMounted = true
    const exclude = ['/signIn', '/signUp', '/new_password', '/otp']
    const notificationOpen = async() => {
      try{
        const isOpen = pathname === `/notifications/${userId}`
        await isNotificationOpened({ isOpen, notificationId: currentUser?.notificationId as string }).unwrap()
      }
      catch(err: unknown){
        const errors = err as ErrorResponse
        (!userId || errors?.originalStatus == 401) ? setLoginPrompt('Open') : null
      }
    }
    if(isMounted && !exclude.includes(pathname)) notificationOpen()

    return () => {
      isMounted = false
    }
  }, [pathname, isNotificationOpened, setLoginPrompt, currentUser?.notificationId, userId])

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

 