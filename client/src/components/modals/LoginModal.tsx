import { ChangeEvent, FormEvent, useState } from 'react'
import ForgotPassword from './ForgotPassword'
import LoginComponent from './LoginComponent'
import useAuthenticationContext from '../../hooks/useAuthenticationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';
import useSWRMutation from "swr/mutation"
import { auth_endPoint } from '../../api/axiosPost';
import useSignIn from '../../hooks/useSignIn';

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const { setAuth, persistLogin, setPersistLogin } = useAuthenticationContext() as AuthenticationContextType
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [forgot, setForgot] = useState<boolean>(false)
  const { theme } = useThemeContext() as ThemeContextType;
  const navigate = useNavigate()
  const signUserIn = useSignIn({email, password})
  const { trigger, error } = useSWRMutation(auth_endPoint, signUserIn)

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)
  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)
  const handleChecked = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked
    setPersistLogin(value)
    localStorage.setItem('persist-login', JSON.stringify(value))
  }

  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try{
      const userAuth = await trigger() as AuthType

      setAuth(prev => ({...prev, ...userAuth}))
      navigate('/')
      toast.promise(trigger(), { 
        loading: 'signing you in 🚀', success: 'welcome', error: 'error occurred' 
      },{
          success:{
            duration: 2000, icon: '🔥'
          },
          style: { background: '#3CB371'}
        }
      )
    }
    catch(err: unknown){
      let errorMessage;
      const errors = error as ErrorResponse
      errors?.response?.status === 201 ? errorMessage = 'Please check your mail to verify your account' 
        : errors?.response?.status === 400 ? errorMessage = 'Bad request' 
          : errors?.response?.status === 401 ? errorMessage = 'Bad credentials' 
            : errors?.response?.status === 404 ? errorMessage = 'You don\'t have an account, Please register' 
              : errors?.response?.status === 403 ? errorMessage = 'Your account is locked' 
                : errors?.response?.status === 500 ? errorMessage = 'Internal server error' : errorMessage = 'No network'

      toast.error(`${errorMessage}`, {
        duration: 3000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const canSubmit = [email, password].every(Boolean)

  return (
    <div className={`welcome w-full ${theme == 'light' ? 'bg-slate-100' : ''}`}>
      {forgot ? 
          <ForgotPassword setForgot={setForgot}/> 
          : <LoginComponent 
              handleSubmit={handleSubmit} handleEmail={handleEmail}
              canSubmit={canSubmit} email={email} setForgot={setForgot} handlePassword={handlePassword} handleChecked={handleChecked} password={password} revealPassword={revealPassword} setRevealPassword={setRevealPassword} 
              persistLogin={persistLogin}
            />
          }
    </div>
  )
}