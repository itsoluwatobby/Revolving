import { Link, useLocation } from "react-router-dom";
import useLogout from "../../hooks/useLogout"
import { useThemeContext } from "../../hooks/useThemeContext"
import { Theme, ThemeContextType } from "../../posts"
import { selectCurrentRoles } from "../../features/auth/authSlice";
import { useSelector } from "react-redux";

type DrawdownProps = {
  rollout: boolean
}

function modalClass(theme: Theme){ 
  return `hover:scale-[1.01] hover:border-b-2 transition-all hover:opacity-90 cursor-pointer rounded capitalize flex items-center p-1 drop-shadow-2xl maxscreen:w-full maxscreen:grid maxscreen:place-content-center maxscreen:border-b-[1px] maxscreen:bg-opacity-60 maxscreen:hover:opacity-80 ${theme == 'light' ? 'bg-slate-100' : ''}`
}

export default function Drawdown({ rollout }: DrawdownProps) {
  const userId = localStorage.getItem('revolving_userId')
  const userRoles = useSelector(selectCurrentRoles)
  const signOut = useLogout()
  const {pathname} = useLocation()
  const home = '/'
  const { theme, setRollout } = useThemeContext() as ThemeContextType
  const excludeRoute = ['/new_story', `/edit_story`, `/story`]

  return (
    <div 
      onClick={() => setRollout(false)}
      className={`absolute rounded-md tracking-widest ${rollout ? '' : '-translate-y-96'} right-6 maxscreen:right-0 maxscreen:w-full maxscreen:bg-opacity-90 maxscreen:flex maxscreen:flex-col maxscreen:items-center maxscreen:top-12 top-10 z-20 shadow-2xl text-sm border ${theme == 'light' ? 'bg-slate-100' : 'bg-slate-800'} transition-all last:border-0 p-2 ${!excludeRoute.includes(home) ? '' : '-translate-y-48'}`}>
    {
      !userRoles?.length && 
        (pathname != '/signIn' &&
          <Link to={`/signIn`}
            className={modalClass(theme)}
          >
              sign In
          </Link>
        )
    }
    {
      userRoles?.length && 
        (
          <Link to={`/profile/${userId}`}
             className={modalClass(theme)}
          >
            profile
          </Link>
        )
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
      userRoles?.length && 
        <button 
          onClick={() => signOut('use')}
          className={modalClass(theme)}>
            sign Out
        </button>
    }
    {
      !userId && 
        (pathname != '/signUp' &&
          <Link to={`/signUp`}
              className={modalClass(theme)}
          >
            sign Up
          </Link>
        )
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