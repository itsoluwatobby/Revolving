import { Link, useLocation } from "react-router-dom";
import useLogout from "../../hooks/useLogout"
import { useThemeContext } from "../../hooks/useThemeContext"
import { Theme, ThemeContextType } from "../../posts"

type DrawdownProps = {
  rollout: boolean
}

function modalClass(theme: Theme){ 
  return `hover:scale-[1.01] hover:border-b-2 transition-all hover:opacity-90 cursor-pointer rounded capitalize flex items-center p-1 drop-shadow-2xl maxscreen:w-full maxscreen:grid maxscreen:place-content-center maxscreen:border-b-[1px] maxscreen:bg-opacity-60 maxscreen:hover:opacity-80 ${theme == 'light' ? 'bg-slate-100' : ''}`
}

export default function Drawdown({ rollout }: DrawdownProps) {
  const userId = localStorage.getItem('revolving_userId')
  const signOut = useLogout()
  const {pathname} = useLocation()
  const home = '/'
  const { theme, setRollout } = useThemeContext() as ThemeContextType
  const excludeRoute = ['/new_story', `/edit_story`, `/story`]

  return (
    <ul className={`absolute rounded-md tracking-widest ${rollout ? '' : '-translate-y-96'} right-6 maxscreen:right-0 maxscreen:w-full maxscreen:bg-opacity-90 maxscreen:flex maxscreen:flex-col maxscreen:items-center maxscreen:top-12 top-10 z-50 shadow-2xl text-sm border ${theme == 'light' ? 'bg-gray-50' : 'bg-gray-600'} transition-all last:border-0 p-2 ${!excludeRoute.includes(home) ? '' : '-translate-y-48'}`}>
    {
      !userId && 
        (pathname != '/signIn' &&
          <li 
            onClick={() => setRollout(false)}
            className={modalClass(theme)}>
            <Link to={`/signIn`}>
              sign In
            </Link>
          </li>
        )
    }
    {
      userId && 
        (
          <li className={modalClass(theme)}>
            <Link to={`/profile/${userId}`}>
              profile
            </Link>
          </li>
        )
    }
    {
      userId && 
      (
        <li className={modalClass(theme)}>
          <Link to={`/account/${userId}`}>
            Account
          </Link>
        </li>
      )
    }
    {
      userId && 
        <li 
          onClick={() => signOut()}
          className={modalClass(theme)}>
            sign Out
        </li>
    }
    {
      !userId && 
        (pathname != '/signUp' &&
          <li className={modalClass(theme)}>
            <Link to={`/signUp`}>
              sign Up
            </Link>
          </li>
        )
    }               
      <li className={modalClass(theme)}>
        <Link to={`/about`}>
          about
        </Link>
      </li>
      <li className={modalClass(theme)}>
        contact
      </li>                                
    </ul>
  // ) : <p></p>
  )
}