import { ChangeEvent, FormEvent, useState } from 'react'
import ForgotPassword from '../components/modals/ForgotPassword'
import LoginComponent from '../components/modals/LoginComponent'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { persistLogin } from '../features/auth/authSlice';
import { useSignInMutation } from '../app/api/authApiSlice';
import { ErrorResponse } from '../data';

export default function Login() {
  const dispatch = useDispatch()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  // const { setAuth, persistLogin, setPersistLogin } = useAuthenticationContext() as AuthenticationContextType
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [forgot, setForgot] = useState<boolean>(false)
  const [signIn, { isLoading, isError, isSuccess }] = useSignInMutation()
  const { theme } = useThemeContext() as ThemeContextType;
  const navigate = useNavigate()
  // const signUserIn = useSignIn({email, password})
  // const { trigger, error, isMutating } = useSWRMutation(auth_endPoint, signUserIn)

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
      await dispatch(setCredentials({...userAuth?.data}))
      setEmail('')
      setPassword('')
      isLoading && toast.loading('signing you in', {
            duration: 3000, icon: '🚀', 
            style: { background: '#3CB341' }
        }
      )
      isSuccess && toast.success('welcome', {
            duration: 2000, icon: '🔥', 
            style: { background: '#3CB371' }
        }
      )
      navigate('/')
    }
    catch(err: unknown){
      let errorMessage;
      const errors = err as ErrorResponse
      errors?.response?.status === 201 ? errorMessage = 'Please check your mail to verify your account' 
        : errors?.response?.status === 400 ? errorMessage = 'Bad request' 
          : errors?.response?.status === 401 ? errorMessage = 'Bad credentials' 
            : errors?.response?.status === 404 ? errorMessage = 'You don\'t have an account, Please register' 
              : errors?.response?.status === 423 ? errorMessage = 'Your account is locked' 
                : errors?.response?.status === 500 ? errorMessage = 'Internal server error' : errorMessage = 'No network'

      isError && toast.error(`${errorMessage}`, {
        duration: 5000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  return (
    <div className={`welcome w-full ${theme == 'light' ? 'bg-slate-100' : ''}`}>
      {forgot ? 
          <ForgotPassword setForgot={setForgot}/> 
          : <LoginComponent 
              handleSubmit={handleSubmit} handleEmail={handleEmail} email={email} 
              setForgot={setForgot} handlePassword={handlePassword} handleChecked={handleChecked} 
              password={password} revealPassword={revealPassword} setRevealPassword={setRevealPassword} 
              loading={isLoading}
            />
          }
    </div>
  )
}