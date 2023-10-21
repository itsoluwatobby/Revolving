import { useEffect } from 'react';
import { TbError404 } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

export default function UnAuthorized() {
  const navigate = useNavigate()

  useEffect(() => {
    const returnTimer = setTimeout(() => {
      navigate('/')
    }, 5000)
    return () => clearTimeout(returnTimer)
  }, [navigate])

  return (
    <div className='w-full h-screen text-center flex flex-col items-center translate-y-28 font-mono gap-8 text-4xl'>
      You are not Authorized
      <TbError404 className='text-gray-500 text-6xl' />
      <span className='text-lg text-gray-700 animate-pulse'>You will be automatically redirected...</span>
    </div>
  )
}