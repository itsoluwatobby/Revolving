import { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

type ForgotProps={
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void,
  handleEmail: (event: ChangeEvent<HTMLInputElement>) => void,
  canSubmit: boolean,
  email: string,
  setForgot: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function ForgotPassword({ 
  handleSubmit, handleEmail, canSubmit, email, setForgot
 }: ForgotProps) {
  const themeMode = localStorage.getItem('theme')

  return (
    <article className={`absolute md:w-1/4 w-1/2 border shadow-2xl ${themeMode == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-x-1/2 translate-y-12 z-50 rounded-md`}>
        <form 
          onSubmit={handleSubmit}
          className='flex flex-col p-2 w-full h-full gap-2'
          >
            <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>SEND REQUEST</h2>
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
          <button 
            type='submit'
            disabled={!canSubmit}
            className={`w-full rounded-md p-2 focus:outline-none border-none ${canSubmit ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
          >
            Request
          </button>
          <div className='flex flex-col text-sm gap-2'>
            <p className='cursor-pointer duration-150 hover:opacity-70 hover:underline hover:underline-offset-2'
            onClick={() => setForgot(false)}
            >Back to login?</p>
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