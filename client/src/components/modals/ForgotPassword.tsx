import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ErrorResponse } from "../../data";
import { useForgotPasswordMutation } from "../../app/api/authApiSlice";

type ForgotProps={
  setForgot: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function ForgotPassword({ setForgot }: ForgotProps) {
  const [email, setEmail] = useState<string>('')
  const themeMode = localStorage.getItem('theme')
  const [forgotPassword, {isLoading, error, isError, isSuccess}] = useForgotPasswordMutation()

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)
  
  const handleResetRequest = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try{
      const res = await forgotPassword(email).unwrap() as unknown as { meta: { message: string } };

      !isLoading && toast.success(res?.meta?.message, {
                      duration: 10000, icon: '🔥', 
                      style: { background: '#6B7F81' }
                    }
                  )
      setEmail('')
    }
    catch(err: unknown){
      const errors = error as ErrorResponse;
      isError && toast.error(`${errors?.data?.meta?.message}`, {
        duration: 10000, icon: '💀', style: {
          background: errors?.status == 403 ? 'A6BCE2' : '#FF0000'
        }
      })
    }
  }
  
  const canSubmit = Boolean(email)

  return (
    <article className={`absolute md:w-1/4 w-1/2 border shadow-2xl ${themeMode == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-x-1/2 translate-y-12 z-30 rounded-md`}>
        <form 
          onSubmit={handleResetRequest}
          className={`flex flex-col p-2 w-full h-full gap-2 ${isLoading && 'bg-gray-400 animate-pulse'}`}
          >
            <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>SEND REQUEST</h2>
          <label htmlFor="email">
          <span className='flex items-center text-sm'>
              Email address
            </span>
            <input 
              type="email" value={email} required
              id='email' placeholder='iamuser@mail.com'
              autoComplete='off' onChange={handleEmail}
              className='w-full rounded-md p-2 focus:outline-none border-none text-black'
            />
          </label>
          <button 
            type='submit'
            disabled={!canSubmit}
            className={`w-full rounded-md p-2 focus:outline-none border-none ${canSubmit ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
          >
            {isLoading ? 'requesting 🚀' : isSuccess ? 'Link sent to mail' : 'Request'}
          </button>
          <div className='flex flex-col text-sm gap-2'>
            <p className='cursor-pointer duration-150 hover:opacity-70 hover:underline hover:underline-offset-2 w-fit'
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