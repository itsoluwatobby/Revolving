import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { BsSend } from 'react-icons/bs';
import { Theme } from '../../posts'
import { sub } from 'date-fns';
import { useDispatch } from 'react-redux';
import { createChatMessage } from '../../features/chat/chatSlice';
import { ChatProps } from '../../data';
import { nanoid } from '@reduxjs/toolkit';

type ChatBaseProp={
  theme: Theme
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
}

export default function ChatBase({ theme, input, setInput }: ChatBaseProp) {
  const inputRef = useRef<HTMLInputElement>(null)
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const dateTime = sub(new Date, { minutes: 0 }).toISOString();
  const dispatch = useDispatch()

  useEffect(() => {
    if(inputRef.current) inputRef?.current.focus()
  }, [])

  const handleChatInput = (event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)
  
  const handleChat = async() => {
    if(!input.length) return
    try{
      const clientMsg = { _id: nanoid(5), message: input, userId: currentUserId, dateTime }
      dispatch(createChatMessage(clientMsg))
      setInput('')
    }
    catch(err){
      console.log(err)
    }
  }

  // ${isLoadingComment ? 'animate-pulse' : null}
  return (
    <section>
      <div
        className={`flex-none w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-700' : 'bg-slate-800'}`}>
        <input 
          type="text"
          ref={inputRef}
          value={input}
          autoComplete="off"
          placeholder="Say hello"
          onChange={handleChatInput}
          className={`flex-auto font-serif p-1.5 h-full text-sm w-10/12 focus:outline-none rounded-md text-white ${theme == 'light' ? '' : ''} bg-inherit`}
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