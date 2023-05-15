import { Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { ChangeEvent, FormEvent } from "react";

type LoginProps={
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void,
  handleEmail: (event: ChangeEvent<HTMLInputElement>) => void,
  handlePassword: (event: ChangeEvent<HTMLInputElement>) => void,
  handleChecked: (event: ChangeEvent<HTMLInputElement>) => void,
  canSubmit: boolean,
  email: string,
  password: string,
  revealPassword: boolean,
  setRevealPassword: React.Dispatch<React.SetStateAction<boolean>>,
  setForgot: React.Dispatch<React.SetStateAction<boolean>>,
  persistLogin: boolean
}

export default function LoginComponent({ 
  handleSubmit, handleEmail, handlePassword, handleChecked, canSubmit, email, password, revealPassword, setRevealPassword, setForgot, persistLogin
 }: LoginProps) {
  const themeMode = localStorage.getItem('theme')

  return (
    <article className={`absolute md:w-1/4 w-1/2 border shadow-2xl ${themeMode == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-x-1/2 translate-y-12 z-50 rounded-md`}>
          <form 
            onSubmit={handleSubmit}
            className='flex flex-col p-2 w-full h-full gap-2'
            >
              <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>SIGN IN</h2>
            <label htmlFor="email">
            <span className='flex items-center text-sm'>
                Email address
              </span>
              <input 
                type="email" 
                value={email}
                required
                id='email'
                placeholder='iamuser@mail.com'
                autoComplete='off'
                onChange={handleEmail}
                className='w-full rounded-md p-2 focus:outline-none border-none text-black'
              />
            </label>
            <label htmlFor="password" className='relative'>
              <span className='flex items-center text-sm'>
                Password
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
            <label htmlFor="persist-login" className='pl-2 flex items-center gap-2'>
              <input 
                type="checkbox" 
                checked={persistLogin}
                id='persist-login'
                onChange={handleChecked}
                className='focus:outline-none h-4 w-4 border-none cursor-pointer'
              />
            <span className="text-sm">Trust Device</span>
            </label>
            <button 
              type='submit'
              disabled={!canSubmit}
              className={`w-full rounded-md p-2 focus:outline-none border-none ${canSubmit ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
            >
              Sign In
            </button>
            <div className='flex flex-col text-sm gap-2'>
              <p className='cursor-pointer duration-150 hover:opacity-70 hover:underline hover:underline-offset-2'
              onClick={() => setForgot(true)}
              >Forgot Password?</p>
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