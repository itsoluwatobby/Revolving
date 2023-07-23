import { Outlet, Navigate, useLocation } from "react-router-dom"
import { useEffect } from 'react';
import { USERROLES } from "../data";
import { useDispatch, useSelector } from "react-redux";
import { setGrantedPermission, grantedPermission } from "../features/auth/userSlice";

type AllowedRolesProp={
  roles: USERROLES[]
}

export const ProtectedRoute = ({ roles }: AllowedRolesProp) => {
  const { pathname } = useLocation()
  const getPermission = useSelector(grantedPermission)
  const delayed = () => new Promise(resolve => setTimeout(() => resolve, 1500))
  const dispatch = useDispatch()

console.log(roles)

  useEffect(() => {
    const permitted = () => {
      const ALLOWEDROLES = [1120, 1159]
      const grantPermission = roles.some(allowed => ALLOWEDROLES.includes(allowed))
      dispatch(setGrantedPermission(grantPermission ? 'ALLOWED' : 'FORBIDDEN'))
      console.log({grantPermission})
    }
    permitted()
  }, [roles, pathname, dispatch])

 console.log({getPermission})
  return(
    <>
      {
         getPermission === 'ALLOWED' ?
        <Outlet /> : <Navigate to={'/signin'} state={pathname}/>
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
