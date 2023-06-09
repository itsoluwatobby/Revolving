import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"


export default function ChatSection() {
  const { theme } = useThemeContext() as ThemeContextType;

  return (
    <section className={`fixed right-1 bottom-2 flex flex-col ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-700'} w-1/2 rounded-md md:w-1/5 z-50`}>
      ChatSection
      <article>
        ChatBody
      </article>
    </section>
  )
}