import { toast } from "react-hot-toast";
import { ErrorResponse } from "../types/data";
import { ThemeContextType } from "../types/posts";
import { ErrorStyle, SuccessStyle } from "../utils/navigator";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useThemeContext } from "../hooks/useThemeContext";
import { useNewPasswordMutation } from "../app/api/authApiSlice";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import PasswordInput from "../components/modals/components/PasswordInput";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";

export default function NewPassword() {
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [match, setMatch] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [newPassword, {isLoading, isSuccess, isError
  }] = useNewPasswordMutation()
  const { theme } = useThemeContext() as ThemeContextType
  const email = location?.search?.split('=')[1]

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)
  const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)

  useEffect(() => {
    setMatch(
      password == confirmPassword
    )
  }, [password, confirmPassword])

  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try{
      await newPassword({ email, resetPass: password }).unwrap();
      setPassword('')
      setConfirmPassword('')
      !isLoading && toast.success('Password reset successful', SuccessStyle)
      navigate('/signIn')
    }
    catch(err: unknown){
      const errors = err as ErrorResponse
      const msg = errors?.status === 'FETCH_ERROR' ?
      'SERVER ERROR' : (errors?.data ? errors?.data?.meta?.message : 'No Network')
      setErrorMsg(msg)
      isError && toast.error(`${msg}`, ErrorStyle)
    }
  }

  useEffect(() => {
    let timeoutId: TimeoutId
    if(errorMsg){
      setTimeout(() => {
        setErrorMsg('')
      }, 8000)
    }
    return () => {
      clearTimeout(timeoutId)
    }
  }, [errorMsg])

  const canSubmit = [password].every(Boolean)

  return (
    <section className={`welcome w-full flex justify-center ${theme == 'light' ? 'bg-slate-100' : ''}`}>

      <article className={`absolute md:w-1/4 w-1/2 mobile:w-3/4 border shadow-2xl text-white ${theme == 'light' ? 'bg-gradient-to-r  from-indigo-600 via-purple-900 to-pink-500 shadow-zinc-800' : 'dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-900 dark:to-slate-700 shadow-zinc-700'} translate-y-12 z-10 rounded-md`}>
        <form 
          onSubmit={handleSubmit}
          className={`flex flex-col p-2 w-full h-full gap-2 ${isLoading && 'bg-gray-400 animate-pulse'}`}
          >
            <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>NEW PASSWORD</h2>
            
            <PasswordInput 
              revealPassword={revealPassword} 
              setRevealPassword={setRevealPassword} 
              password={password} handlePassword={handlePassword} 
              handleConfirmPassword={handleConfirmPassword} 
              confirmPassword={confirmPassword} match={match}
            />

          <button 
            type='submit'
            disabled={!canSubmit && !match && !isLoading}
            className={`w-[95%] mx-auto mt-2 rounded-sm ${errorMsg?.length ? 'bg-red-600' : ''}  ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'} p-2 focus:outline-none border-none ${(canSubmit && match && !errorMsg?.length) ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
          >
            {
              errorMsg ? errorMsg 
                  : (
                      isLoading ? 'Submitting...' 
                        : isSuccess ? 'Reset Successful' 
                            : 'Submit'
                    )
            }
          </button>

          <div className='flex flex-col text-sm gap-2'>
            <Link to={'/signIn'}>
              <p className='cursor-pointer duration-150 hover:opacity-70 hover:underline hover:underline-offset-2 w-fit'
              >Back to login?</p>
            </Link>
            <p className=''>Don't have an account?&nbsp; 
              <Link to={'/signUp'}>
                <span className='w-fit hover:underline hover:underline-offset-2 cursor-pointer duration-150 hover:opacity-70'>Sign Up Here</span>
              </Link>
            </p>
          </div>
        </form>

      </article>
    </section>
  )
}