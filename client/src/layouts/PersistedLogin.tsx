import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { persisted, selectCurrentToken, setCredentials } from '../features/auth/authSlice';
import { useNewAccessTokenMutation } from '../app/api/authApiSlice';
import { AuthType } from '../data';
import whiteBGloader from '../assets/whiteloader.svg'
import darkBGloader from '../assets/darkLoader.svg'
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';
import { LeftSection } from '../components/LeftSection';

export const PersistedLogin = () => {
  const location = useLocation()
  const storyId = location.pathname.split('/')[2]
  const pathname = location.pathname
  const { theme, toggleLeft } = useThemeContext() as ThemeContextType
  const token = useSelector(selectCurrentToken)
  const persistLogin = useSelector(persisted)
  const dispatch = useDispatch()
  const [getNewAccessToken, { data, isLoading, isError }] = useNewAccessTokenMutation()

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  useEffect(() => {
    const getNewToken = async() => {
      await getNewAccessToken()
      const res = data as unknown as {data: AuthType}
      dispatch(setCredentials({...res?.data}))
    }
    (!token && persistLogin) ? getNewToken() : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className={`welcome flex items-center`}>
      <aside className={`min-w-[250px] ${address.includes(pathname) ? 'hidden' : 'md:block'} mt-5 h-full ${toggleLeft == 'Hide' ? 'hidden' : 'maxscreen:w-full maxscreen:fixed maxscreen:block maxscreen:z-50 maxscreen:top-14'}`}>
        <LeftSection />
      </aside>
      <div className='h-full w-full md:w-full '>
        {
          !token ? 
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

 