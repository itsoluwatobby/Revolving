import { Outlet, Navigate, useLocation } from "react-router-dom"
import { useState, useEffect } from 'react';
import { USERROLES } from "../data";

type AllowedRolesProp={
  roles: USERROLES[]
}
type Permission = 'ALLOWED' | 'FORBIDDEN' | 'NIL'
export const ProtectedRoute = ({ roles }: AllowedRolesProp) => {
  const { pathname } = useLocation()
  const [isAllowed, setIsAllowed] = useState<Permission>('NIL')
  console.log({isAllowed})
console.log(roles)
console.log(pathname)
  useEffect(() => {
    let isMounted = true
    const permitted = () => {
      const ALLOWEDROLES = [1120, 1154]
      const grantedPermission = ALLOWEDROLES.map(allowed => roles.includes(allowed)).find(permit => permit == true)
      grantedPermission ? setIsAllowed('ALLOWED') : setIsAllowed('FORBIDDEN')
      console.log({grantedPermission})
    }
    isMounted ? permitted() : null
    return () => {
      isMounted = false
    }
  }, [roles, pathname])

  return(
    <>
      {
         isAllowed == 'ALLOWED' ?
        <Outlet /> : <Navigate to={'/signin'} state={pathname}/>
      }
    </>
  )

  // TODO: PROTECT NEWSTORY, EDITSTORY, PERSONAL PROFILE
}