import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import useSWRMutation from "swr/mutation";
import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';
import { auth_endPoint } from '../../api/axiosPost';
import { toast } from 'react-hot-toast';
import useSignUp from '../../hooks/useSignUp';
import RegistrationForm from './RegistrationForm';
import { ErrorResponse } from '../../data';


export default function RegisterModal() {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [validPassword, setValidPassword] = useState<boolean>(false)
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [validEmail, setValidEmail] = useState<boolean>(false);
  const [match, setMatch] = useState<boolean>(false);
  const { theme, setRollout } = useThemeContext() as ThemeContextType;
  const signUpUser = useSignUp({username, email, password})
  const { trigger, isMutating, error } = useSWRMutation(auth_endPoint, signUpUser);
  const navigate = useNavigate()

  const emailRegex = /^[a-zA-Z\d]+[@][a-zA-Z\d]{2,}\.[a-z]{2,4}$/
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!£%*?&])[A-Za-z\d@£$!%*?&]{9,}$/;

  const handleUsername = (event: ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)
  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)
  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)
  const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)

  useEffect(() => {
    setValidEmail(
      emailRegex.test(email)
    )
  }, [email])

  useEffect(() => {
    setValidPassword(
      passwordRegex.test(password)
    )
  }, [password])
  
  useEffect(() => {
    setMatch(
      password == confirmPassword
    )
  }, [password, confirmPassword])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let message = '';
    try{
      const res = await trigger() as unknown as { status: number };
      res?.status === 200 
        ? message = 'Please check your email to verify your account' 
          : res?.status === 201 ? message = 'Please check your email to verify your account' : null;

      toast.promise(trigger(), { 
        loading: 'signing you up 🚀', success: message, error: 'error occurred' 
      },{
          success:{
            duration: 2000, icon: '🔥'
          },
          style: { background: '#3CB371'}
        }
      )
      setEmail('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      navigate('/')
    }
    catch(err: unknown){
      let errorMessage;
      const errors = error as ErrorResponse
        errors?.response?.status === 400 ? errorMessage = 'Email failed, Sign in to get a new mail' 
              : errors?.response?.status === 423 ? errorMessage = 'Your account is locked'
              : errors?.response?.status === 409 ? errorMessage = 'Email taken'
                : errors?.response?.status === 500 ? errorMessage = 'Internal server error' : errorMessage = 'No network'

      toast.error(`${errorMessage}`, {
        duration: 5000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  return (
    <div 
      onClick={() => setRollout(false)}
      className={`welcome w-full ${theme == 'light' ? 'bg-slate-100' : ''}`}>
      <RegistrationForm 
        handleSubmit={handleSubmit} handleEmail={handleEmail} handleUsername={handleUsername} 
        username={username} email={email} password={password} match={match} 
        confirmPassword={confirmPassword} handlePassword={handlePassword} 
        handleConfirmPassword={handleConfirmPassword} revealPassword={revealPassword} 
        setRevealPassword={setRevealPassword} validEmail={validEmail} validPassword={validPassword} 
        loading={isMutating} setValidEmail={setValidEmail} setValidPassword={setValidPassword} 
      />
    </div>
  )
}