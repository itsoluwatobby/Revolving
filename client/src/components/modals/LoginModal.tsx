import { ChangeEvent, FormEvent, useState } from 'react'
import ForgotPassword from './ForgotPassword'
import LoginComponent from './LoginComponent'

// type Props = {}

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(
    JSON.parse(localStorage.getItem('remember-me') as string) as boolean || false)
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [forgot, setForgot] = useState<boolean>(false)
  const themeMode = localStorage.getItem('theme')

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)
  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)
  const handleChecked = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked
    setRememberMe(value)
    localStorage.setItem('remember-me', JSON.stringify(value))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

  }

  const canSubmit = [email, password].every(Boolean)

  return (
    <div className={`welcome w-full ${themeMode == 'light' ? 'bg-slate-100' : ''}`}>
      {forgot ? 
          <ForgotPassword 
            handleSubmit={handleSubmit} handleEmail={handleEmail}
            canSubmit={canSubmit} email={email} setForgot={setForgot}
          /> 
          : <LoginComponent 
              handleSubmit={handleSubmit} handleEmail={handleEmail}
              canSubmit={canSubmit} email={email} setForgot={setForgot} handlePassword={handlePassword} handleChecked={handleChecked} password={password} revealPassword={revealPassword} setRevealPassword={setRevealPassword} 
              rememberMe={rememberMe}
            />
          }
    </div>
  )
}