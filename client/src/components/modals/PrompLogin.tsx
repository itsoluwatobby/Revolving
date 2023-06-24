import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"
import { Link } from "react-router-dom"

export default function PrompLogin() {
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType

  return (
    <main 
      onClick={() => setLoginPrompt('Hide')}
      className="single_page fixed top-20 w-full z-50 bg-slate-500 bg-opacity-20 grid place-content-center">
      <article className={`p-5 flex z-50 font-mono flex-col items-center gap-3.5 shadow-2xl capitalize text-base shadow-gray-800 ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-700'} rounded-md`}>
        Please sigin to continue
        <Link to={'/signIn'}>
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