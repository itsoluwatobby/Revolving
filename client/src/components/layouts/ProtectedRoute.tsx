import React from 'react'
import { Outlet, Navigate } from 'react-router-dom';

type RolesProps={
  roles: number[]
}

export const ProtectedRoute = ({ roles }: RolesProps) => {

  return (
    <>
      {
        roles.includes(1120) ? 
          <Outlet /> 
            : <Navigate to={'/login'} replace={true} />}
    </>
  )
}
