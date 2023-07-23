import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useThemeContext } from '../hooks/useThemeContext';
import { ThemeContextType } from '../posts';
import { toast } from 'react-hot-toast';
import RegistrationForm from '../components/modals/RegistrationForm';
import { ErrorResponse } from '../data';
import { useSignUpMutation } from '../app/api/authApiSlice';
import { ErrorStyle, SuccessStyle } from '../utils/navigator';


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
  const [signUp, { isLoading, isError, error, isSuccess }] = useSignUpMutation()

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
    try{
      const res = await signUp({username, email, password}).unwrap() as unknown as { data: { meta: { message: string } } };
      !isLoading && toast.success(res?.data?.meta?.message, SuccessStyle)
      setEmail('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
    }
    catch(err: unknown){
      const errors = error as ErrorResponse
      isError && toast.error(`${errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  return (
    <div 
      onClick={() => setRollout(false)}
      className={`welcome w-full flex justify-center ${theme == 'light' ? 'bg-slate-100' : ''}`}>
      <RegistrationForm 
        handleSubmit={handleSubmit} handleEmail={handleEmail} handleUsername={handleUsername} 
        username={username} email={email} password={password} match={match} 
        confirmPassword={confirmPassword} handlePassword={handlePassword} 
        handleConfirmPassword={handleConfirmPassword} revealPassword={revealPassword} 
        setRevealPassword={setRevealPassword} validEmail={validEmail} validPassword={validPassword} 
        loading={isLoading} setValidEmail={setValidEmail} setValidPassword={setValidPassword} 
      />
    </div>
  )
}