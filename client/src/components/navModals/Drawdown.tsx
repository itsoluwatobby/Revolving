import { Link } from "react-router-dom"
import useAuthenticationContext from "../../hooks/useAuthenticationContext"
import useLogout from "../../hooks/useLogout"
import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"

const modalClass = 'hover:scale-[1.01] hover:border-b-2 transition-all hover:opacity-90 cursor-pointer rounded capitalize flex items-center p-1 shadow-2xl'

export default function Drawdown() {
  const { auth } = useAuthenticationContext() as AuthenticationContextType
  const signOut = useLogout()
  const { theme } = useThemeContext() as ThemeContextType

  return (
    <ul className={`absolute rounded-md tracking-widest right-6 top-10 z-50 text-sm border ${theme == 'light' ? 'bg-gray-200' : 'bg-gray-600'} last:border-0 p-2`}>
    {
      !auth?._id && 
        <li className={modalClass}>
          <Link to={`/signIn`}>
            sign In
          </Link>
        </li>
    }
    <li className={modalClass}>
      <Link to={`/settings`}>
        settings
      </Link>
    </li>
    {
      auth?._id && 
        <li 
          onClick={signOut}
          className={modalClass}>
            sign Out
        </li>
    }
    {
      !auth?._id && 
        <li className={modalClass}>
          <Link to={`/signUp`}>
            sign Up
          </Link>
        </li>
    }               
      <li className={modalClass}>
        <Link to={`/about`}>
          about
        </Link>
      </li>
      <li className={modalClass}>contact</li>                                
  </ul>
  )
}