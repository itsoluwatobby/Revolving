import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { selectCurrentToken, setCredentials } from '../features/auth/authSlice';
import { persisted } from '../features/auth/authSlice';
import { useNewAccessTokenQuery } from '../app/api/authApiSlice';
import { AuthType } from '../data';
import whiteBGloader from '../assets/whiteloader.svg'
import darkBGloader from '../assets/darkLoader.svg'
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';

export const PersistedLogin = () => {
  const location = useLocation()
  const { theme } = useThemeContext() as ThemeContextType
  const token = useSelector(selectCurrentToken)
  const persistLogin = useSelector(persisted)
  const dispatch = useDispatch()
  const {data, isLoading, isError, refetch} = useNewAccessTokenQuery()
  
  useEffect(() => {
    if(!token){
      refetch()
      const res = data as unknown as {data: AuthType}
      dispatch(setCredentials({...res?.data}))
    }
  }, [token, refetch, data, dispatch])

  return (
    <>
      {
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
            !persistLogin && token ? 
            <Outlet />
              :
                token ? 
                    <Outlet />
                    : isError && <Navigate to='/signIn' state={{ from: location }} replace />
              )
      } 
    </>
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