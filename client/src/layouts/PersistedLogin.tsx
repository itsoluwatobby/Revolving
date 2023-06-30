import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { selectCurrentToken, setCredentials } from '../features/auth/authSlice';
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
  const { theme, toggleLeft, setToggleLeft } = useThemeContext() as ThemeContextType
  const token = useSelector(selectCurrentToken)
  const persistLogin = JSON.parse(localStorage.getItem('persist-login') as string) as unknown as boolean
  const dispatch = useDispatch()
  const {data, isLoading, isError, refetch} = useNewAccessTokenQuery()

  const address = ['/new_story', `/edit_story/${storyId}`, `/story/${storyId}`]

  useEffect(() => {
    if(persistLogin && !token){
      refetch()
      const res = data as unknown as {data: AuthType}
      dispatch(setCredentials({...res?.data}))
    }
  }, [token, refetch, data, dispatch, persistLogin])

  /*
    flex-grow rounded-lg mt-4 pb-4 md:block ${toggleLeft == 'Hide' ? 'hidden' : 'maxscreen:fixed block z-50 w-full'} md:flex md:w-1/5 h-full border border-l-slate-500 border-b-0 border-slate-600
  */

  return (
    <main className={`welcome flex items-center`}>
      <aside className={`w-1/5 ${address.includes(pathname) ? 'hidden' : ''} mt-5 h-full ${toggleLeft == 'Hide' ? 'maxscreen:hidden' : 'maxscreen:w-11/12 maxscreen:fixed maxscreen:block maxscreen:z-50 maxscreen:top-14'}`}>
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