import { useCallback } from 'react';
import { UserProps } from "../../data";
import { useSelector } from "react-redux";
import useLogout from "../../hooks/useLogout"
import { FaTimesCircle } from "react-icons/fa";
import { Theme, ThemeContextType } from "../../posts";
import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../../hooks/useThemeContext"
import { selectCurrentRoles } from "../../features/auth/authSlice";

type DrawdownProps = {
  rollout: boolean,
  storyId: string,
  currentUser: UserProps,
}

export default function Drawdown({ rollout, storyId, currentUser }: DrawdownProps) {
  const userId = localStorage.getItem('revolving_userId')
  const userRoles = useSelector(selectCurrentRoles)
  const signOut = useLogout()
  const {pathname} = useLocation()
  const home = '/'
  const { theme, setRollout } = useThemeContext() as ThemeContextType
  const excludeRoute = ['/new_story', `/edit_story`, `/story/${storyId}`]

  const address = ['/new_story', `/edit_story/${storyId}`]
  const exclude = ['/signIn', '/signUp', '/new_password', '/otp']
  
  const modalClass = useCallback((theme: Theme) => { 
    return `hover:scale-[1.01] hover:border-b-2 whitespace-nowrap border-none transition-all hover:opacity-90 cursor-pointer midscreen:rounded-sm midscreen:p-4 capitalize flex items-center p-1 midscreen:drop-shadow-2xl midscreen:w-full midscreen:grid midscreen:place-content-center midscreen:border-b-[1px] midscreen:bg-opacity-80 midscreen:hover:opacity-90 ${theme == 'light' ? 'midscreen:hover:bg-slate-200' : 'midscreen:hover:bg-slate-600'}`
  }, [])

  const arrow_class = useCallback(() => {
    return ("text-xl text-gray-700 cursor-pointer shadow-lg hover:scale-[1.05] active:scale-[0.98] hover:text-gray-600 transition-all ease-in-out")
  }, [])
// lg:-translate-x-24 lg:w-[13%]
  return (
    <div 
      className={`midscreen:fixed midscreen:h-full midscreen:z-50 midscreen:rounded-md tracking-widest ${rollout ? '' : 'midscreen:-translate-x-96 midscreen:hidden'} midscreen:right-0 midscreen:w-full midscreen:bg-opacity-80 midscreen:flex midscreen:flex-col midscreen:items-center midscreen:top-0 text-sm ${theme == 'light' ? 'midscreen:bg-slate-100' : 'midscreen:bg-slate-800'} transition-all last:border-0 p-2 midscreen:p-0 ${!excludeRoute.includes(home) ? '' : '-translate-y-48'} ${excludeRoute?.includes(pathname) ? 'hidden' : 'flex'} flex-row w-[40%] justify-between`}>
      <div className={`md:flex-auto md:block sm:hidden midscreen:font-medium ${theme === 'light' ? 'midscreen:bg-gray-400' : 'midscreen:bg-slate-900'} midscreen:self-end midscreen:flex midscreen:flex-col midscreen:gap-3 midscreen:h-full midscreen:w-1/3`}>

        <div className="midscreen:flex flex-row-reverse items-center justify-between p-1 px-2 sm:hidden">
        {
            !exclude?.includes(pathname) ?
              <div 
                onClick={() => setRollout(false)}
                className='w-10 rounded-full h-10'>
                {!currentUser?.displayPicture?.photo ?
                    <div className='cursor-pointer w-8 h-8 bg-slate-500 rounded-full border-2 border-slate-600'></div>
                    :
                  <Link to={`/profile/${currentUser?._id}`}>
                    <figure className='w-10 h-10 bg-slate-800 rounded-full border-2 border-gray-300 cursor-pointer'>
                      <img src={currentUser?.displayPicture?.photo} alt="dp" className='object-cover h-full w-full rounded-full'/>
                    </figure>
                  </Link>
                }
              </div>
            : null
          }
          {!address.includes(pathname) ? 
                  <FaTimesCircle  
                    onClick={() => setRollout(false)}
                    className={`midscreen:block hidden font-thin ${arrow_class()}`} /> : null
          }
        </div>

        <div className='md:flex md:items-center md:justify-between'>
          {
            pathname !== '/' ?
              <Link to={`/`}
                onClick={() => setRollout(false)}
                className={modalClass(theme)}
              >
                  Home
              </Link> 
            : null
          }
          {
            !userRoles?.length ?
              (pathname != '/signIn' ?
                <Link to={`/signIn`}
                  onClick={() => setRollout(false)}
                  className={modalClass(theme)}
                >
                    Sign In
                </Link> 
                : null
              )
            : null
          }
          {
            (userRoles?.length && pathname !== `/profile/${userId}`) ?
              (
                <Link 
                  onClick={() => setRollout(false)}
                  to={`/profile/${userId}`}
                  className={modalClass(theme)}
                >
                  Profile
                  {/* <IoIosArrowDown /> */}
                </Link>
              )
            : null
          }
          {
            (userRoles?.length && pathname !== `/notifications/${userId}`) ?
              (
                <Link 
                  onClick={() => setRollout(false)}
                  to={`/notifications/${userId}`}
                  className={modalClass(theme)}
                >
                  Notifications
                </Link>
              )
            : null
          }
          {
            (userRoles?.length && pathname !== `/taskManager/${userId}`) ?
              (
                <Link 
                  onClick={() => setRollout(false)}
                  to={`/taskManager/${userId}`}
                  className={modalClass(theme)}
                >
                  Task manager
                </Link>
              )
            : null
          }
          {
            !userId ? 
            (pathname != '/signUp' &&
            <Link 
              onClick={() => setRollout(false)}
              to={`/signUp`}
              className={modalClass(theme)}
            >
                  Sign Up
                </Link>
              )
              : null
            }               
           {
              pathname !== '/about' ?
                <Link 
                  onClick={() => setRollout(false)}
                  to={`/about`}
                  className={modalClass(theme)}
                  >
                  About
                </Link>
              : null
            }
            {
              userRoles?.length ? 
                <button 
                  onClick={() => signOut('dont')}
                  className={modalClass(theme)}>
                    Sign Out
                </button>
              : null
            }
            {/* <button className={modalClass(theme)}>
              Contact
            </button>                                 */}
        </div>

      </div>

    </div>
  )
}