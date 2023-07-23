import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PasswordInput from "../components/modals/components/PasswordInput";
import { useNewPasswordMutation } from "../app/api/authApiSlice";
import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";
import { toast } from "react-hot-toast";
import { ErrorResponse } from "../data";
import { SuccessStyle } from "../utils/navigator";

export default function NewPassword() {
  const [password, setPassword] = useState<string>('')
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [match, setMatch] = useState<boolean>(false)
  const location = useLocation()
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
    }
    catch(err: unknown){
      const errors = err as ErrorResponse
      const msg = errors?.data ? errors?.data?.meta?.message : 'No Network'
      isError && toast.error(`${msg}`, {
        duration: 10000, icon: '💀', style: {
          background: errors?.status == 403 ? 'A6BCE2' : '#FF0000'
        }
      })
    }
  }

  const canSubmit = [password].every(Boolean)
  return (
    <article className={`absolute md:w-1/4 w-1/2 border shadow-2xl ${theme == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-x-1/2 translate-y-12 z-30 rounded-md`}>
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
            disabled={!canSubmit && !match}
            className={`w-full mt-2 rounded-md p-2 focus:outline-none border-none ${(canSubmit && match) ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
          >
            {isSuccess ? 'Reset Successful' : 'Submit'}
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