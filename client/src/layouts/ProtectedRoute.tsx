import { useEffect } from 'react';
import { USERROLES } from "../types/data";
import { useDispatch, useSelector } from "react-redux";
import { IsLayoutLoading } from "../components/IsLayoutLoading";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import { setGrantedPermission, grantedPermission } from "../features/auth/userSlice";
import { Outlet, Navigate, useLocation, useNavigate, useParams } from "react-router-dom"

type AllowedRolesProp={
  roles: USERROLES[]
}

export const ProtectedRoute = ({ roles }: AllowedRolesProp) => {
  const dispatch = useDispatch()
  const { userId } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const getPermission = useSelector(grantedPermission)
  const currentUserId = localStorage.getItem('revolving_userId') as string

  useEffect(() => {
    let isMounted = true
    if(!roles?.length) {
      dispatch(setGrantedPermission('AUTHENTICATING'))
      return
    }
    const permitted = () => {
      if(userId !== currentUserId) return navigate(-1)
      const ALLOWEDROLES = [1120, 1159]
      const grantPermission = roles?.some(allowed => ALLOWEDROLES?.includes(allowed))
      dispatch(setGrantedPermission(grantPermission ? 'ALLOWED' : 'FORBIDDEN'))
    }
    isMounted ? permitted() : null
    return () => {
      isMounted = false
    }
  }, [roles, pathname, dispatch, userId, navigate, currentUserId])

  useEffect(() => {
    let timerId: TimeoutId
    if(getPermission === 'AUTHENTICATING'){
      timerId = setTimeout(() => {
        navigate('/signIn', { state: { pathname } })
        localStorage.removeItem('revolving_login_time')
      }, 15000);
    }
    return () => {
      clearTimeout(timerId)
    }
  }, [getPermission, navigate, pathname])

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
