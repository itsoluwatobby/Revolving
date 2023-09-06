import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from 'react';
import { USERROLES } from "../data";
import { useDispatch, useSelector } from "react-redux";
import { setGrantedPermission, grantedPermission } from "../features/auth/userSlice";
import { ThemeContextType } from "../posts";
import { useThemeContext } from "../hooks/useThemeContext";
import { IsLayoutLoading } from "../components/IsLayoutLoading";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";

type AllowedRolesProp={
  roles: USERROLES[]
}

export const ProtectedRoute = ({ roles }: AllowedRolesProp) => {
  const { pathname } = useLocation()
  const { theme } = useThemeContext() as ThemeContextType
  const getPermission = useSelector(grantedPermission)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    if(!roles?.length) {
      dispatch(setGrantedPermission('AUTHENTICATING'))
      return
    }
    const permitted = () => {
      const ALLOWEDROLES = [1120, 1159]
      const grantPermission = roles?.some(allowed => ALLOWEDROLES?.includes(allowed))
      dispatch(setGrantedPermission(grantPermission ? 'ALLOWED' : 'FORBIDDEN'))
    }
    isMounted ? permitted() : null

    return () => {
      isMounted = false
    }
  }, [roles, pathname, dispatch])

  useEffect(() => {
    let timerId: TimeoutId
    if(getPermission === 'AUTHENTICATING'){
      timerId = setTimeout(() => {
        navigate('/signIn', { state: { pathname } })
      }, 15000);
    }
    return () => {
      clearTimeout(timerId)
    }
  }, [getPermission, navigate, pathname])

  console.log(getPermission)
  console.log(roles)

  return(
    <>
      {
        getPermission !== 'AUTHENTICATING' ? (
          getPermission === 'ALLOWED' ?
            <Outlet /> : <Navigate to={'/signin'} state={pathname}/>
        ) : <IsLayoutLoading />
      }
    </>
  )
  // TODO: PROTECT NEWSTORY, EDITSTORY, PERSONAL PROFILE
}

// const userPlatform = () => {
//   if(navigator?.userAgent){
//     const userAgent = navigator.userAgent.toLowerCase()
//     const mobileRegex = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i
//     const platform = mobileRegex.test(userAgent) ? 'mobile' : 'web'
//     return platform
//   }
//   else return 'unknown'
// }
