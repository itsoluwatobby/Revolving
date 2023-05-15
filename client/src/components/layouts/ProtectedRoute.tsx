import { Outlet, Navigate } from 'react-router-dom';
import useAuthenticationContext from '../../hooks/useAuthenticationContext';

type RolesProps={
  roles: number[]
}

export const ProtectedRoute = ({ roles }: RolesProps) => {
  //const { auth, persistLogin } = useAuthenticationContext() as AuthenticationContextType
  
  return (
    <>
      {
        roles.includes(1120) ? 
          <Outlet /> 
            : <Navigate to={'/login'} replace={true} />}
    </>
  )
}
