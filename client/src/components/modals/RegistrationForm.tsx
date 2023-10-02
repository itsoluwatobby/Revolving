import { Link } from 'react-router-dom';
import { BsCheck } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { RegistrationProps } from '../../data';
import { ThemeContextType } from '../../posts';
import PasswordInput from './components/PasswordInput';
import { useThemeContext } from '../../hooks/useThemeContext';

export default function RegistrationForm({
  handleSubmit, handleEmail, handlePassword, handleUsername, handleConfirmPassword, loading, validEmail, match, username, email, password, confirmPassword, revealPassword, setRevealPassword, confirmationBy, setConfirmationBy
}: RegistrationProps) {
  const { theme } = useThemeContext() as ThemeContextType

  const canSubmit = [username, email, password].every(Boolean)

  return (
    <article className={`absolute sm:w-[50%] md:w-[40%] lg:w-[30%] maxscreen:w-[65%] mobile:w-3/4 border shadow-2xl text-white ${theme == 'light' ? 'bg-gradient-to-r from-indigo-600 via-purple-900 to-pink-500 shadow-zinc-800' : 'dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-900 dark:to-slate-700 shadow-zinc-800'} md:m-auto translate-y-12 z-10 rounded-md`}>
          <form 
            onSubmit={handleSubmit}
            className={`flex flex-col p-1 pr-0 pl-0 w-full h-full gap-1 ${loading && 'bg-gray-400 animate-pulse'}`}
            >
              <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>SIGN UP</h2>
            <div className='flex flex-col w-full p-2 pt-0 pb-0 gap-0.5'>
              <label htmlFor='name' className='flex items-center font-medium text-sm'>
                Username
              </label>
              <input 
                type="text" 
                value={username}
                required
                id='name'
                name='name'
                min={3}
                placeholder='iamuser'
                onChange={handleUsername}
                className='w-full rounded-sm p-1.5 focus:outline-none border-none text-black'
              />
            </div>
            <div className='flex flex-col w-full p-2 pt-0 pb-0 gap-0.5'>
            <label htmlFor='email' className='flex items-center gap-2 font-medium text-sm'>
              Email address
              {email && (validEmail ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='ml-1 text-red-500' />)}
              </label>
              <input 
                type="email" 
                value={email}
                required
                name='email'
                id='email'
                min={3}
                placeholder='iamuser@mail.com'
                onChange={handleEmail}
                className='w-full rounded-sm p-1.5 focus:outline-none border-none text-black'
              />
            </div>
            
            <PasswordInput 
              revealPassword={revealPassword} 
              setRevealPassword={setRevealPassword} 
              password={password} match={match}
              handlePassword={handlePassword} handleConfirmPassword={handleConfirmPassword} 
              confirmPassword={confirmPassword}
            />
            <div className='flex items-center px-2 p-1 gap-3 text-sm'>
              <p>Confirm by:</p>
              <div className='flex items-center gap-2'>
                <button 
                  type='button'
                  onClick={() => setConfirmationBy('LINK')}
                  title='default'
                  className={`p-0.5 rounded-sm shadow-lg  ${confirmationBy === 'LINK' ? 'bg-green-500' : 'bg-slate-700'} px-2 hover:opacity-90 active:opacity-100`}
                >Link</button>
                <button
                  type='button'
                  onClick={() => setConfirmationBy('OTP')}
                  title='receive otp'
                  className={`p-0.5 rounded-sm shadow-lg ${confirmationBy === 'OTP' ? 'bg-green-500' : 'bg-slate-700'} px-2 hover:opacity-90 active:opacity-100`}
                >OTP</button>
              </div>
            </div>
            <button 
              type='submit'
              disabled={!canSubmit && !loading && !match && !validEmail}
              className={`w-[95%] self-center mt-2 rounded-sm ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} p-2 focus:outline-none border-none ${(canSubmit && !loading && validEmail && match) ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
            >
              {!loading ? 'Sign Up' : 'Signing Up...'}
            </button>
            <div className='flex flex-col text-sm gap-2 p-2 pt-0 pb-0'>
              <p className='p-1'>Have an account?&nbsp;
                <Link to={'/signIn'}>
                  <span className='hover:underline hover:underline-offset-2 cursor-pointer duration-150 hover:opacity-70 w-fit'>Sign In</span>
                </Link>
              </p>
            </div>
          </form>
      </article>
  )
}