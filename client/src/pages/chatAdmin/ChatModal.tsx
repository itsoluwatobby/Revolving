import ChatHeader from "../../components/chat/ChatHeader";
import ChatBody from "../../components/chat/ChatBody";
import ChatBase from "../../components/chat/ChatBase";
import { useThemeContext } from "../../hooks/useThemeContext"
import { ThemeContextType } from "../../posts"


export default function ChatModal() {
  const { theme } = useThemeContext() as ThemeContextType;

  return (
    <section className={`fixed right-1 bottom-2 flex flex-col ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-700'} w-1/2 rounded-md md:w-1/5 z-50 p-1 h-80`}>
      <main className="relative flex flex-col w-full h-full">
        <ChatHeader theme={theme} />
        <ChatBody theme={theme} />
        <ChatBase theme={theme} />
      </main>
    </section>
  )
}