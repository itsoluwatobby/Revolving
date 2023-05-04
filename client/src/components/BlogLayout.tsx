import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const BlogLayout = () => {

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}