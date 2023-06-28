import { useSelector } from 'react-redux'
import { Theme, ThemeContextType } from '../../posts'
import { useState, useEffect } from 'react'
import { getChatMessages } from '../../features/chat/chatSlice'
import { ChatProps } from '../../data'
import { useThemeContext } from '../../hooks/useThemeContext'
import { format } from 'timeago.js';


const DELAY = 250 as const

export default function ChatBody() {
  const [typedInput, setTypedInput] = useState<string>('')
  const {theme, openChat} = useThemeContext() as ThemeContextType;
  const [customMessage, setCustomMessage] = useState<ChatProps>()
  const getChats = useSelector(getChatMessages)

  useEffect(() => {
    let isMounted = true
    let currentIndex = 0
    
    const inputValue = customMessage?.message?.split('') as string[]
    const typedFunc = async() =>{
      if(currentIndex < inputValue.length - 1){
        setTypedInput(prev => prev += inputValue[currentIndex-1])
        setTimeout(typedFunc, DELAY)
        currentIndex++
      }
    }
    isMounted ? typedFunc() : null

  }, [customMessage])

  useEffect(() => {
    let isMounted = true
    let customIndex = 0
    if(getChats.length == 3) customIndex+=2
    if(openChat == 'Open'){
      isMounted && setCustomMessage(getChats[customIndex] as ChatProps)
      setTypedInput('')
    }
    else{
      customIndex = 0
    }
    return () => {
      isMounted = false
    }
  }, [openChat, getChats])

  const chatContent = (
    getChats?.length && getChats.map(chat => (
      <article 
        key={chat._id}
        className={`flex ${chat.adminId ? 'self-start' : 'self-end flex-row-reverse'} text-white items-center shadow-slate-800 text-xs bg-slate-500 rounded-md rounded-br-none gap-2 p-1 shadow-md w-5/6`}>
        <figure className={`flex-none rounded-full border border-white bg-slate-800 w-8 h-8 shadow-lg`}>

        </figure>
        <p className='flex-auto flex flex-col text-justify tracking-tight whitespace-pre-wrap'>
          {chat.adminId ? 
            <span className={`w-full whitespace-pre-wrap text-justify`}>
              {typedInput}
            </span>
            :
            <span className={`w-full`}>
              {chat.message}
            </span>
          }
          <span className={`w-full text-right text-xs`} >
            {format(chat.dateTime as string)}
          </span>
        </p>
      </article>
    ))
  )


  return (
    <section className={`hidebars text-sm flex-auto flex flex-col gap-1.5 w-full box-border ${theme == 'light' ? '' : 'bg-slate-600'} overflow-y-scroll p-1.5 pl-1 pr-1`}>
      {chatContent}
    </section>
  )
}