import { LoginProps } from "../../data";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { ThemeContextType } from "../../posts";
import { persisted } from "../../features/auth/authSlice";
import { useThemeContext } from "../../hooks/useThemeContext";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

export default function LoginComponent({ 
  handleSubmit, handleEmail, loading, handlePassword, handleChecked, email, password, revealPassword, setRevealPassword, setForgot
 }: LoginProps) {
  const {theme} = useThemeContext() as ThemeContextType
  const persistLogin = useSelector(persisted)
//translate-x-1/2
  const canSubmit = [email, password].every(Boolean)
  return (
    <article className={`absolute sm:w-[50%] md:w-[40%] lg:w-[30%] maxscreen:w-[65%] mobile:w-3/4 border shadow-2xl text-white ${theme == 'light' ? 'bg-gradient-to-r from-indigo-600 via-purple-900 to-pink-500 shadow-zinc-800' : 'dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-900 dark:to-slate-700 shadow-zinc-700'} translate-y-12 z-10 rounded-md`}>
          <form 
            onSubmit={handleSubmit}
            className={`flex flex-col p-1 w-full h-full gap-2 ${loading && 'bg-gray-400 animate-pulse'}`}
            >
              <h2 className='open_sans text-center font-extrabold drop-shadow-xl'>SIGN IN</h2>

            <div className="flex flex-col w-full p-2 pt-0 pb-0 gap-1">
              <label  htmlFor="email" className='flex items-center text-sm'>
                Email address
              </label>
              <input 
                type="email" 
                value={email}
                required
                id='email'
                name="email"
                placeholder='iamuser@mail.com'
                onChange={handleEmail}
                className='w-full rounded-sm p-2 focus:outline-none border-none text-black'
              />
            </div>

            <div className='relative flex flex-col pt-0 pb-0 w-full p-2 gap-1'>
              <label htmlFor="password" className='flex items-center text-sm'>
                Password
              </label>
              <input 
                type={revealPassword ? "text" : "password"} 
                value={password}
                id='password'
                name="password"
                required
                placeholder='*************'
                autoComplete='off'
                onChange={handlePassword}
                className='relative w-full rounded-sm p-2 focus:outline-none border-none text-black'
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
            </div>

            <div className='pl-2 flex items-center gap-2'>
              <input 
                type="checkbox" 
                checked={persistLogin}
                id='persist-login'
                onChange={handleChecked}
                className='focus:outline-none h-4 w-4 border-none cursor-pointer'
              />
             <label htmlFor="persist-login" className="text-sm">Trust This Device</label>
            </div>

            <button 
              type='submit'
              disabled={!canSubmit && !loading}
              className={`w-[95%] self-center ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} rounded-sm p-2 focus:outline-none border-none ${(canSubmit && !loading) ? 'bg-green-400 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
            >
              {!loading ? 'Sign In' : 'Signing In...'}
            </button>

            <div className='flex flex-col text-sm gap-2'>
              <p className='cursor-pointer w-fit duration-150 hover:opacity-70 hover:underline hover:underline-offset-2'
              onClick={() => setForgot(true)}
              >Forgot Password?</p>
              <p className=''>Don't have an account?&nbsp; 
                <Link to={'/signUp'}>
                  <span className='hover:underline w-fit hover:underline-offset-2 cursor-pointer duration-150 hover:opacity-70'>Sign Up Here</span>
                </Link>
              </p>
            </div>

          </form>
      </article>
  )
}