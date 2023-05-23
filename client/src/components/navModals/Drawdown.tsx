import { Link, useLocation } from "react-router-dom";
import useLogout from "../../hooks/useLogout"
import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"

const modalClass = 'hover:scale-[1.01] hover:border-b-2 transition-all hover:opacity-90 cursor-pointer rounded capitalize flex items-center p-1 drop-shadow-2xl'

export default function Drawdown() {
  const userId = localStorage.getItem('revolving_userId')
  const signOut = useLogout()
  const {pathname} = useLocation()
  const home = '/'
  const { theme, setRollout } = useThemeContext() as ThemeContextType
  const excludeRoute = ['/new_story', `/edit_story`, `/story`]

  return (
    !excludeRoute.includes(home) ? (
    <ul className={`absolute rounded-md tracking-widest right-6 top-10 z-50 shadow-2xl text-sm border ${theme == 'light' ? 'bg-gray-50' : 'bg-gray-600'} last:border-0 p-2`}>
    {
      !userId && 
        (pathname != '/signIn' &&
          <li 
            onClick={() => setRollout(false)}
            className={modalClass}>
            <Link to={`/signIn`}>
              sign In
            </Link>
          </li>
        )
    }
    {userId && 
      (
        <li className={modalClass}>
          <Link to={`/profile/${userId}`}>
            profile
          </Link>
        </li>
      )
    }
    {userId && 
      (
        <li className={modalClass}>
          <Link to={`/account/${userId}`}>
            Account
          </Link>
        </li>
      )
    }
    {
      userId && 
        <li 
          onClick={signOut}
          className={modalClass}>
            sign Out
        </li>
    }
    {
      !userId && 
        (pathname != '/signUp' &&
          <li className={modalClass}>
            <Link to={`/signUp`}>
              sign Up
            </Link>
          </li>
        )
    }               
      <li className={modalClass}>
        <Link to={`/about`}>
          about
        </Link>
      </li>
      <li className={modalClass}>contact</li>                                
  </ul>
  ) : <p></p>
  )
}