import { useThemeContext } from "../hooks/useThemeContext"
import { ThemeContextType } from "../posts"


export default function ProfilePage() {
  const { theme } = useThemeContext() as ThemeContextType

  return (
    <main className="p-2 flex md:flex-row flex-col gap-2 h-full">
      <div className="relative h-1/4 rounded-md">
        <figure className="bg-slate-700 h-full rounded-md">
          cover photo
        </figure>
        <figure className="rounded-full border-4 border-white  w-28 h-28 absolute top-28 left-48 bg-slate-600">

        </figure>
      </div>
      <div>
        {/* country */}
      </div>
      <div className={`w-full translate-y-16 border ${theme == 'light' ? 'border-gray-200' : 'border-white'}`}/>
    </main>
  )
}