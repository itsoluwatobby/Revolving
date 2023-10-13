import { ErrorResponse } from '../data';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { ThemeContextType } from '../posts';
import { SuccessStyle } from '../utils/navigator';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { persistLogin } from '../features/auth/authSlice';
import { useThemeContext } from '../hooks/useThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import { useSignInMutation } from '../app/api/authApiSlice';
import ForgotPassword from '../components/modals/ForgotPassword';
import LoginComponent from '../components/modals/LoginComponent';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';

export default function Login() {
  const dispatch = useDispatch()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [forgot, setForgot] = useState<boolean>(false)
  const [signIn, { isLoading, isError }] = useSignInMutation()
  const { theme } = useThemeContext() as ThemeContextType;
  const location = useLocation()
  const pathname: string = location.state ? location?.state : '/'
  const navigate = useNavigate()

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)
  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)
  const handleChecked = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked
    dispatch(persistLogin(value))
  }

  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try{
      const userAuth = await signIn({ email, password }).unwrap();
      localStorage.setItem('revolving_userId', userAuth?.data?._id)
      dispatch(setCredentials({...userAuth?.data}))
      if(!localStorage.getItem('revolving_login_time')){
        localStorage.setItem('revolving_login_time', userAuth?.data?.updatedAt)
      }
      setEmail('')
      setPassword('')
      isLoading && toast.loading('signing you in', {
            duration: 3000, icon: '🚀', 
            style: { background: '#3CB341' }
        }
      )
      !isLoading && toast.success('welcome', SuccessStyle)
      navigate(pathname, { replace: true })
    }
    catch(err: unknown){
      const errors = err as ErrorResponse
      const message = errors?.status == 'FETCH_ERROR' ? 'SERVER ERROR' : errors?.data?.meta?.message
      setErrorMsg(message)
      isError && toast.error(`${message}`, {
        duration: 10000, icon: '💀', style: {
          background: errors?.status == 403 ? 'A6BCE2' : '#FF0000',
          color: '#FFFFFF'
        }
      })
      if(errors?.status == 404) {
        setTimeout(() => {
          navigate('/signUp')
        }, 10000);
      }
    }
  }

  useEffect(() => {
    let timeoutId: TimeoutId
    if(errorMsg){
      setTimeout(() => {
        setErrorMsg('')
      }, 8000)
    }
    return () => {
      clearTimeout(timeoutId)
    }
  }, [errorMsg])

  return (
    <section className={`welcome w-full flex justify-center ${theme == 'light' ? 'bg-slate-100' : ''}`}>
      {forgot ? 
          <ForgotPassword setForgot={setForgot}/>
          : 
          <LoginComponent 
            handleSubmit={handleSubmit} handleEmail={handleEmail} email={email} 
            setForgot={setForgot} handlePassword={handlePassword} handleChecked={handleChecked} 
            password={password} revealPassword={revealPassword} setRevealPassword={setRevealPassword} 
            loading={isLoading} errorMsg={errorMsg}
          />
          }
    </section>
  )
}