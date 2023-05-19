import { useEffect } from 'react'
import { TbError404 } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    const returnTimer = setTimeout(() => {
      navigate(-1)
    }, 4000)
    return () => clearTimeout(returnTimer)
  }, [navigate])

  return (
    <div className='w-full h-screen flex flex-col items-center translate-y-28 font-mono gap-8 text-4xl'>
      Page Not Found
      <TbError404 className='text-gray-300 text-6xl' />
      <span className='text-lg text-gray-300 animate-pulse'>You will be automatically redirected...</span>
    </div>
  )
}