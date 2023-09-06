import { Link, useLocation } from "react-router-dom";
import useLogout from "../../hooks/useLogout"
import { useThemeContext } from "../../hooks/useThemeContext"
import { Theme, ThemeContextType } from "../../posts"
import { selectCurrentRoles } from "../../features/auth/authSlice";
import { useSelector } from "react-redux";
import { useCallback } from 'react'

type DrawdownProps = {
  rollout: boolean,
  storyId: string
}


export default function Drawdown({ rollout, storyId }: DrawdownProps) {
  const userId = localStorage.getItem('revolving_userId')
  const userRoles = useSelector(selectCurrentRoles)
  const signOut = useLogout()
  const {pathname} = useLocation()
  const home = '/'
  const { theme, setRollout } = useThemeContext() as ThemeContextType
  const excludeRoute = ['/new_story', `/edit_story`, `/story/${storyId}`]
  
  const modalClass = useCallback((theme: Theme) => { 
    return `hover:scale-[1.01] hover:border-b-2 whitespace-nowrap border-none transition-all hover:opacity-90 cursor-pointer maxscreen:rounded-md capitalize flex items-center p-1 maxmobile:drop-shadow-2xl maxscreen:w-full maxscreen:grid maxscreen:place-content-center maxscreen:border-b-[1px] maxscreen:bg-opacity-60 maxscreen:hover:opacity-80 ${theme == 'light' ? 'maxscreen:bg-slate-100' : ''}`
  }, [])

  return (
    <div 
      onClick={() => setRollout(false)}
      className={`maxscreen:absolute maxscreen:rounded-md sm:gap-1 sm:flex-auto tracking-widest ${rollout ? '' : 'maxscreen:-translate-y-96 maxscreen:hidden'} maxscreen:right-0 maxscreen:w-full maxscreen:bg-opacity-90 maxscreen:flex maxscreen:flex-col maxscreen:items-center maxscreen:top-12 z-20 maxscreen:shadow-2xl text-sm maxscreen:border ${theme == 'light' ? 'maxscreen:bg-slate-100' : 'maxscreen:bg-slate-800'} transition-all last:border-0 p-2 ${!excludeRoute.includes(home) ? '' : '-translate-y-48'} ${excludeRoute?.includes(pathname) ? 'hidden' : 'flex'} flex-row w-[40%] sm:-translate-x-1 lg:-translate-x-24 lg:w-[13%] justify-between`}>
    {
      !userRoles?.length ?
        (pathname != '/signIn' ?
          <Link to={`/signIn`}
            className={modalClass(theme)}
          >
              sign In
          </Link> 
          : null
        )
      : null
    }
    {
      userRoles?.length ?
        (
          <Link to={`/profile/${userId}`}
             className={modalClass(theme)}
          >
            profile
            {/* <IoIosArrowDown /> */}
          </Link>
        )
      : null
    }
    {/* {
      userId && 
      (
        <Link to={`/account/${userId}`}
           className={modalClass(theme)}
        >
          Account
        </Link>
      )
    } */}
    {
      userRoles?.length ? 
        <button 
          onClick={() => signOut('use')}
          className={modalClass(theme)}>
            sign Out
        </button>
      : null
    }
    {
      !userId ? 
        (pathname != '/signUp' &&
          <Link to={`/signUp`}
              className={modalClass(theme)}
          >
            sign Up
          </Link>
        )
      : null
    }               
      <Link to={`/about`}
          className={modalClass(theme)}
      >
        about
      </Link>
      <button className={modalClass(theme)}>
        contact
      </button>                                
    </div>
  // ) : <p></p>
  )
}