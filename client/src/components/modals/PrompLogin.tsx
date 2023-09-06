import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"
import { Link, useLocation } from "react-router-dom"

export default function PrompLogin() {
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const { pathname } = useLocation()

  return (
    <main 
      onClick={() => setLoginPrompt('Hide')}
      className="single_page fixed top-20 w-full z-50 bg-slate-500 bg-opacity-20 grid place-content-center">
      <article className={`p-4 flex z-50 text-sm text-white font-mono flex-col items-center gap-3.5 shadow-2xl capitalize shadow-gray-800 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-700'} rounded-md`}>
        {pathname == '/new_story' ? 'Please copy entries as progess may be lost' : 'Please sigin to continue'}
        <Link to={'/signIn'} state={pathname}>
          <button 
            onClick={() => setLoginPrompt('Hide')}
            className="border rounded-md p-2 bg-slate-400 shadow-lg hover:bg-slate-500 transition-all active:scale-[1.03] uppercase font-medium text-gray-900">
            Sign in
          </button>
        </Link>
      </article>
    </main>
  )
}