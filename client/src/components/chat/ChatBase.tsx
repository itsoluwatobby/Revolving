import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { BsSend } from 'react-icons/bs';
import { Theme } from '../../posts'

type ChatBaseProp={
  theme: Theme
}

export default function ChatBase({ theme }: ChatBaseProp) {
  const [entry, setEntry] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if(inputRef.current) inputRef?.current.focus()
  }, [])

  const handleChatInput = (event: ChangeEvent<HTMLInputElement>) => setEntry(event.target.value)
  
  const handleChat = async() => {

    return
  }

  // ${isLoadingComment ? 'animate-pulse' : null}
  return (
    <section>
      <div
        className={`flex-none w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-800'}`}>
        <input 
          type="text"
          ref={inputRef}
          value={entry}
          autoComplete="off"
          placeholder="Say hello"
          onChange={handleChatInput}
          className={`flex-auto font-serif p-1.5 h-full text-sm w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
        />
        <button 
          onClick={handleChat}
          className="flex-none w-12 hover:bg-opacity-40 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
      </div>
    </section>
  )
}