import { useThemeContext } from "../../hooks/useThemeContext"
import ChatHeader from "../../components/chat/ChatHeader";
import ChatBody from "../../components/chat/ChatBody";
import ChatBase from "../../components/chat/ChatBase";
import { ThemeContextType } from "../../posts";
import { useState } from "react";

export default function ChatModal() {
  const { theme } = useThemeContext() as ThemeContextType;
  const [input, setInput] = useState<string>('')

  return (
    <section className={`fixed right-1 bottom-2 flex flex-col ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-700 shadow-slate-800'} rounded-md w-64 z-50 p-1 h-80 shadow-2xl`}>
      <main className="relative flex flex-col w-full h-full">
        <ChatHeader theme={theme} />
        <ChatBody />
        <ChatBase 
          theme={theme} 
          input={input} 
          setInput={setInput} 
        />
      </main>
    </section>
  )
}