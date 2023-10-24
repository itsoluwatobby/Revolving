import { toast } from "react-hot-toast";
import { ErrorStyle } from "../../utils/navigator";
import { Link, useNavigate } from "react-router-dom";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useForgotPasswordMutation } from "../../app/api/authApiSlice";
import { ConfirmationMethodType, ErrorResponse } from "../../types/data";

type ForgotProps={
  setForgot: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function ForgotPassword({ setForgot }: ForgotProps) {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const themeMode = localStorage.getItem('theme')
  const [confirmationBy, setConfirmationBy] = useState<ConfirmationMethodType>('LINK')
  const [forgotPassword, {isLoading, error, isError, isSuccess}] = useForgotPasswordMutation()

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)
  
  const handleResetRequest = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try{
      const res = await forgotPassword({ email, type: confirmationBy }).unwrap() as unknown as { meta: { message: string } };

      !isLoading && toast.success(res?.meta?.message, {
                      duration: 10000, icon: '🔥', 
                      style: { background: '#6B7F81' }
                    }
                  )
      setEmail('')
      confirmationBy === 'OTP' ? navigate(`/otp?email=${email}&type=PASSWORD`) : null
    }
    catch(err: unknown){
      const errors = error as ErrorResponse;
      const message = errors?.data?.meta?.message
      setErrorMsg(message)
      isError && toast.error(`${message}`, ErrorStyle)
    }
  }
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if(errorMsg){
      setTimeout(() => {
        setErrorMsg('')
      }, 8000)
    }
    return () => {
      clearTimeout(timeoutId)
    }
  }, [errorMsg])

  const canSubmit = Boolean(email)

  return (
    <article className={`absolute sm:w-[50%] md:w-[40%] lg:w-[30%] maxscreen:w-[65%] mobile:w-3/4 border shadow-2xl text-white ${themeMode == 'light' ? 'bg-gradient-to-r from-indigo-600 via-purple-900 to-pink-500 shadow-zinc-800' : 'dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-900 dark:to-slate-700 shadow-zinc-700'} md:m-auto translate-y-12 z-10 rounded-md`}>
      <form 
        onSubmit={handleResetRequest}
        className={`flex flex-col py-1 w-full h-full gap-0.5 ${isLoading && 'bg-gray-400 animate-pulse'}`}
        >
        <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>SEND REQUEST</h2>
        
        <div className="flex flex-col w-full p-2 pt-0 pb-0 gap-0.5">
          <label htmlFor="email" className='flex items-center text-sm'>
            Email address
          </label>
          <input 
            type="email" value={email} required
            id='email' placeholder='iamuser@mail.com'
            autoComplete='on' onChange={handleEmail}
            className='w-full rounded-sm p-2 focus:outline-none border-none text-black'
          />
        </div>

        <div className='flex items-center px-2 p-1 gap-3 text-sm'>
          <p>Recieve:</p>
          <div className='flex items-center gap-2 text-[13px]'>
            <button 
              type='button'
              onClick={() => setConfirmationBy('LINK')}
              title='default'
              className={`rounded-sm shadow-lg ${confirmationBy === 'LINK' ? 'bg-green-500' : 'bg-slate-700'} px-2 hover:opacity-90 active:opacity-100`}
            >Link</button>
            <button
              type='button'
              onClick={() => setConfirmationBy('OTP')}
              title='receive otp'
              className={`rounded-sm shadow-lg ${confirmationBy === 'OTP' ? 'bg-green-500' : 'bg-slate-700'} px-2 hover:opacity-90 active:opacity-100`}
            >OTP</button>
          </div>
        </div>
        
        <button 
          type='submit'
          disabled={!canSubmit && !isLoading}
          className={`w-[95%] self-center ${errorMsg?.length ? 'bg-red-600' : ''} ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'} rounded-sm p-2 focus:outline-none border-none ${(canSubmit && !errorMsg?.length) ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
        >
          {
            errorMsg ? errorMsg 
                : (
                    isLoading ? 'Requesting...' 
                        : isSuccess ? 'Link sent to mail' 
                            : 'Request'
                  )
          }
        </button>
        <div className='flex flex-col p-2 pt-0 pb-0 text-sm mt-2 gap-1'>
          <p className='cursor-pointer duration-150 hover:opacity-70 hover:underline hover:underline-offset-2 w-fit'
          onClick={() => setForgot(false)}
          >Back to login?</p>
          <p className=''>Don't have an account?&nbsp; 
            <Link to={'/signUp'}>
              <span className='hover:underline hover:underline-offset-2 cursor-pointer duration-150 hover:opacity-70 w-fit'>Sign Up Here</span>
            </Link>
          </p>
        </div>
      </form>
    </article>
  )
}