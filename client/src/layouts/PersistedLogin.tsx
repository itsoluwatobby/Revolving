import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { persisted, selectCurrentToken, setCredentials } from '../features/auth/authSlice';
import { useNewAccessTokenQuery } from '../app/api/authApiSlice';
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
  const {data, isLoading, isError, refetch} = useNewAccessTokenQuery()

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  useEffect(() => {
    const getNewToken = async() => {
      await refetch()
      const res = data as unknown as {data: AuthType}
      dispatch(setCredentials({...res?.data}))
    }
    !token ? getNewToken() : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*
    flex-grow rounded-lg mt-4 pb-4 md:block ${toggleLeft == 'Hide' ? 'hidden' : 'maxscreen:fixed block z-50 w-full'} md:flex md:w-1/5 h-full border border-l-slate-500 border-b-0 border-slate-600
  */

  return (
    <main className={`welcome flex items-center`}>
      <aside className={`min-w-[250px] ${address.includes(pathname) ? 'hidden' : 'md:block'} mt-5 h-full ${toggleLeft == 'Hide' ? 'hidden' : 'maxscreen:w-full maxscreen:fixed maxscreen:block maxscreen:z-50 maxscreen:top-14'}`}>
        <LeftSection />
      </aside>
      <div className='h-full w-full'>
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

 // (theme == 'light' ?
//   <figure className='border-none'>
//     <img src={whiteBGloader} 
//       alt="Loading..." 
//       className='bg-inherit border-none m-auto translate-y-40'
//     />
//   </figure>
//   :
//   <figure className='border-none'>
//     <img src={darkBGloader} 
//       alt="Loading..." 
//       className='bg-inherit border-none m-auto translate-y-40'
//     />
//   </figure>
// )