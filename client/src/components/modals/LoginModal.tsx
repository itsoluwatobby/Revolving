import { ChangeEvent, FormEvent, useState } from 'react'
import ForgotPassword from './ForgotPassword'
import LoginComponent from './LoginComponent'
import useAuthenticationContext from '../../hooks/useAuthenticationContext';
import { axiosAuth } from '../../api/axiosPost';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { auth, setAuth, persistLogin, setPersistLogin } = useAuthenticationContext() as AuthenticationContextType
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [forgot, setForgot] = useState<boolean>(false)
  const { theme } = useThemeContext() as ThemeContextType
  const navigate = useNavigate()

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
      setIsLoading(true)
      const res = await axiosAuth.post('/login', {
        email, password
      })
      setAuth(res?.data)
      toast.success('Success!, You are in', {
        duration: 2000, icon: '🔥', style: {
          background: '#2EFF2E'
        }
      })
      navigate('/')
    }
    catch(err: unknown){
      let errorMessage;
      const errors = err as ErrorResponse
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
    finally{
      setIsLoading(false)
    }
  }
console.log(auth)
  const canSubmit = [email, password].every(Boolean)

  return (
    <div className={`welcome w-full ${theme == 'light' ? 'bg-slate-100' : ''}`}>
      {forgot ? 
          <ForgotPassword 
            handleSubmit={handleSubmit} handleEmail={handleEmail}
            canSubmit={canSubmit} email={email} setForgot={setForgot}
          /> 
          : <LoginComponent 
              handleSubmit={handleSubmit} handleEmail={handleEmail}
              canSubmit={canSubmit} email={email} setForgot={setForgot} handlePassword={handlePassword} handleChecked={handleChecked} password={password} revealPassword={revealPassword} setRevealPassword={setRevealPassword} 
              persistLogin={persistLogin}
            />
          }
    </div>
  )
}