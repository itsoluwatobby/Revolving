import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

export const BlogLayout = () => {

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}