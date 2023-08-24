import { BsCheck } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { RegistrationProps } from '../../data';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';
import PasswordInput from './components/PasswordInput';

export default function RegistrationForm({
  handleSubmit, handleEmail, handlePassword, handleUsername, handleConfirmPassword, loading, validEmail, match, username, email, password, confirmPassword, revealPassword, setRevealPassword
}: RegistrationProps) {
  const { theme } = useThemeContext() as ThemeContextType

  const canSubmit = [username, email, password].every(Boolean)

  return (
    <article className={`absolute md:w-1/3 pt-2 pb-2 lg:w-3/5 w-[40%] maxscreen:w-[55%] border shadow-2xl ${theme == 'light' ? 'bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-100 shadow-zinc-400' : 'dark:bg-gradient-to-r dark:from-slate-600 dark:via-slate-700 dark:to-slate-500 shadow-zinc-700'} md:m-auto translate-y-12 z-30 rounded-md`}>
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
                autoComplete='off'
                onChange={handleUsername}
                className='w-full rounded-md p-1.5 focus:outline-none border-none text-black'
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
                autoComplete='off'
                onChange={handleEmail}
                className='w-full rounded-md p-1.5 focus:outline-none border-none text-black'
              />
            </div>
            
            <PasswordInput 
              revealPassword={revealPassword} 
              setRevealPassword={setRevealPassword} 
              password={password} match={match}
              handlePassword={handlePassword} handleConfirmPassword={handleConfirmPassword} 
              confirmPassword={confirmPassword}
            />

            <button 
              type='submit'
              disabled={!canSubmit && !loading && !match && !validEmail}
              className={`w-[95%] self-center mt-2 rounded-md p-2 focus:outline-none border-none ${(canSubmit && !loading && validEmail && match) ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
            >
              {!loading ? 'Sign Up' : 'Signing Up...'}
            </button>
            <div className='flex flex-col text-sm gap-2 p-2 pt-0 pb-0'>
              <p className=''>Have an account?&nbsp;
                <Link to={'/signIn'}>
                  <span className='hover:underline hover:underline-offset-2 cursor-pointer duration-150 hover:opacity-70'>Sign In</span>
                </Link>
              </p>
            </div>
          </form>
      </article>
  )
}