import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { BsCheck } from 'react-icons/bs'
import { FaTimes } from 'react-icons/fa'

export default function NewPassword() {
  const [password, setPassword] = useState<string>('')
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [validPassword, setValidPassword] = useState<boolean>(false)
  const [match, setMatch] = useState<boolean>(false)
  const themeMode = localStorage.getItem('theme')

  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)
  const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)

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

  const canSubmit = [password].every(Boolean)
  return (
    <article className={`absolute md:w-1/4 w-1/2 border shadow-2xl ${themeMode == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-x-1/2 translate-y-12 z-50 rounded-md`}>
        <form 
          onSubmit={handleSubmit}
          className='flex flex-col p-2 w-full h-full gap-2'
          >
            <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>NEW PASSWORD</h2>
            <label htmlFor="password" className='relative'>
              <span className='flex items-center text-sm'>
                Password
                {validPassword ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='ml-1 text-red-500'/>}
              </span>
              <input 
                type={revealPassword ? "text" : "password"} 
                value={password}
                id='password'
                required
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
                {/* {validPassword ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='ml-1 text-red-500' />} */}
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
            className={`w-full rounded-md p-2 focus:outline-none border-none ${canSubmit ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
          >
            Request password
          </button>
          <div className='flex flex-col text-sm gap-2'>
            <Link to={'/signIn'}>
              <p className='cursor-pointer duration-150 hover:opacity-70 hover:underline hover:underline-offset-2'
              >Back to login?</p>
            </Link>
            <p className=''>Don't have an account?&nbsp; 
              <Link to={'/signUp'}>
                <span className='hover:underline hover:underline-offset-2 cursor-pointer duration-150 hover:opacity-70'>Sign Up Here</span>
              </Link>
            </p>
          </div>
        </form>
      </article>
  )
}