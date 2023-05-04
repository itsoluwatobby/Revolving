import React from 'react'
import { Outlet, Navigate } from 'react-router-dom';

export const ProtectedRoute = () => {

  return (
    <>
      <Outlet />
    </>
  )
}
