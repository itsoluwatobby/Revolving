import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { BsCheck } from 'react-icons/bs'
import { FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'


export default function RegisterModal() {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [validPassword, setValidPassword] = useState<boolean>(false)
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [validEmail, setValidEmail] = useState<boolean>(false)
  const [match, setMatch] = useState<boolean>(false)
  const themeMode = localStorage.getItem('theme')

  const emailRegex = /^[a-zA-Z\d]+[@][a-zA-Z\d]{2,}\.[a-z]{2,4}$/
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

  }

  const canSubmit = [username, email, password].every(Boolean)

  return (
    <div className={`welcome w-full ${themeMode == 'light' ? 'bg-slate-100' : ''}`}>
      <article className={`absolute md:w-1/4 w-1/2 border shadow-2xl ${themeMode == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-x-1/2 translate-y-12 z-50 rounded-md`}>
          <form 
            onSubmit={handleSubmit}
            className='flex flex-col p-2 w-full h-full gap-2'
            >
              <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>SIGN UP</h2>
            <label htmlFor="username">
              <span className='flex items-center font-medium text-sm'>
                Username
              </span>
              <input 
                type="username" 
                value={username}
                required
                id='username'
                min={3}
                placeholder='iamuser'
                autoComplete='off'
                onChange={handleUsername}
                className='w-full rounded-md p-2 focus:outline-none border-none text-black'
              />
            </label>
            <label htmlFor="email">
            <span className='flex items-center gap-2 font-medium text-sm'>
              Email address
              {validEmail ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='ml-1 text-red-500' />}
              </span>
              <input 
                type="email" 
                value={email}
                required
                id='email'
                min={3}
                pattern='/^[a-zA-Z\d]+[@][a-zA-Z\d]{2,}\.[a-z]{2,4}$/'
                placeholder='iamuser@mail.com'
                autoComplete='off'
                onChange={handleEmail}
                className='w-full rounded-md p-2 focus:outline-none border-none text-black'
              />
            </label>
            <label htmlFor="password" className='relative'>
            <span className='flex items-center gap-2 font-medium text-sm'>
              Password
              {validPassword ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='ml-1 text-red-500' />}
            </span>
              <input 
                type={revealPassword ? "text" : "password"} 
                value={password}
                id='password'
                required
                min={7}
                pattern={passwordRegex.toString()}
                placeholder='*************'
                autoComplete='false'
                onChange={handlePassword}
                className='relative w-full rounded-md p-2 focus:outline-none border-none text-black'
              />
              {
                revealPassword ? 
                    <AiFillEye 
                      title='Show' 
                      onClick={() => setRevealPassword(false)}
                      className={`absolute cursor-pointer hover:opacity-90 text-slate-700 right-2 duration-100 bottom-2 text-2xl`} /> 
                        : <AiFillEyeInvisible 
                            title='Hide' 
                            onClick={() => setRevealPassword(true)}
                            className={`absolute cursor-pointer hover:opacity-90 text-slate-700 right-2 duration-100 bottom-2 text-2xl`} />
              }
            </label>
            <label htmlFor="confirm-pwd" className='relative'>
              <span className='flex items-center gap-2 font-medium text-sm'>
                Confirm password
                {validPassword ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes />}
              </span>
                <input 
                  type='password' 
                  value={confirmPassword}
                  id='confirm-pwd'
                  required
                  placeholder='*************'
                  autoComplete='false'
                  onChange={handleConfirmPassword}
                  className='relative w-full rounded-md p-2 focus:outline-none border-none text-black'
                />
            </label>
            <button 
              type='submit'
              disabled={!canSubmit}
              className={`w-full mt-2 rounded-md p-2 focus:outline-none border-none ${canSubmit ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
            >
              Sign Up
            </button>
            <div className='flex flex-col text-sm gap-2'>
              <p className=''>Have an account?&nbsp;
                <Link to={'/signIn'}>
                  <span className='hover:underline hover:underline-offset-2 cursor-pointer duration-150 hover:opacity-70'>Sign In</span>
                </Link>
              </p>
            </div>
          </form>
      </article>
    </div>
  )
}