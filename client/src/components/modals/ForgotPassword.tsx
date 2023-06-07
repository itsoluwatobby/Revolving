import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import useSWRMutation from 'swr/mutation';
import { toast } from "react-hot-toast";
import { axiosAuth } from "../../api/axiosPost";

type ForgotProps={
  setForgot: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function ForgotPassword({ setForgot }: ForgotProps) {
  const [email, setEmail] = useState<string>('')
  const themeMode = localStorage.getItem('theme')
  //const { trigger, error } = useSWRMutation('/forgot_password', '')

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)
  
  const handleResetRequest = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try{
      //const reset = await axiosAuth.get(`/forgot_password?email=${}`)
      // const reset = await trigger()

      // toast.promise(trigger(), { 
      //   loading: 'requesting password reset 🚀', success: 'request sent', error: 'error occurred' 
      // },{
      //     success:{
      //       duration: 5000, icon: '🔥'
      //     },
      //     style: { background: '#3CB371'}
      //   }
      // )
    }
    catch(err: unknown){
      let errorMessage;
      //const errors = error as ErrorResponse
      // errors?.response?.status === 201 ? errorMessage = 'Please check your mail to verify your account' 
      //   : errors?.response?.status === 400 ? errorMessage = 'Bad request' 
      //     : errors?.response?.status === 401 ? errorMessage = 'Bad credentials'
      //         : errors?.response?.status === 403 ? errorMessage = 'Your account is locked' 
      //           : errors?.response?.status === 500 ? errorMessage = 'Internal server error' : errorMessage = 'No network'

      toast.error(`${errorMessage}`, {
        duration: 3000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }
  
  const canSubmit = [email].every(Boolean)

  return (
    <article className={`absolute md:w-1/4 w-1/2 border shadow-2xl ${themeMode == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-x-1/2 translate-y-12 z-30 rounded-md`}>
        <form 
          onSubmit={handleResetRequest}
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