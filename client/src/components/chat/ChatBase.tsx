import { BsSend } from 'react-icons/bs';
import { GetConvoType, Theme } from '../../posts';
import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { ErrorResponse, MessageModelType, TypingEvent, UserProps } from '../../data';
import { useCreateMessageMutation, useUpdateMessageStatusMutation } from '../../app/api/messageApiSlice';
import { Socket } from 'socket.io-client';
import { useDelayedInput } from '../../hooks/useDelayedInput';

type ChatBaseProp={
  theme: Theme,
  currentChat: GetConvoType,
  currentUser: Partial<UserProps>
  socket: Socket
}

const prevEntries = ''
export default function ChatBase({ theme, socket, currentChat, currentUser }: ChatBaseProp) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState<string>('')
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [createMessage, { isError }] = useCreateMessageMutation()
  const [updateMessage] = useUpdateMessageStatusMutation()
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    if(inputRef.current) inputRef?.current.focus()
  }, [])

  useEffect(() => {
    let isMounted = true, timeoutId: NodeJS.Timeout;
    if(isMounted && isError){
      timeoutId = setTimeout(() => {
        setErrorMsg('')
      }, 4000)
    }
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [isError])

  useEffect(() => {
    if(!currentUser) return
    const { firstName, _id } = currentUser
    if(inputRef?.current?.value) {
      socket.emit('is_typing', { firstName, userId: _id, conversationId: currentChat?._id })
    }
    else {
      socket.emit('typing_stopped', { firstName, userId: _id, conversationId: currentChat?._id })
    }
  }, [socket, currentChat?._id, currentUser])
  
  const handleMessage = async() => {
    if(!input.length) return
    try{
      const newMessage = { 
        message: input, senderId: currentUserId, receiverId: currentChat?.userId, 
        conversationId: currentChat?._id, referencedMessage: {}
      } as Partial<MessageModelType>
      const res = await createMessage(newMessage).unwrap()
      setInput('')
      socket.emit('create_message', res, async(acknowledgement: any) => {
        console.log(acknowledgement)
        // await updateMessage({messageId: res?._id, status: 'DELIVERED'}).unwrap()
      })
    }
    catch(err){
      const errors = err as ErrorResponse
      setErrorMsg(errors?.message as string)
    }
  }

  return (
    <section
      onKeyUpCapture={event => event.key === 'Enter' ? handleMessage() : ''}
    >
      <div
        className={`flex-none relative w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-700' : 'bg-slate-800'}`}>
        <div className={`absolute -top-8 ${errorMsg?.length ? 'scale-100' : 'scale-0'} transition-all bg-slate-400 rounded-sm p-1 w-[95%] left-2 text-[12px] text-center text-red-500 whitespace-pre-wrap`}>{errorMsg}</div>
        <input 
          type="text"
          ref={inputRef}
          value={input}
          autoComplete="off"
          placeholder="Say hello"
          onChange={event => setInput(event.target.value)}
          className={`flex-auto font-serif p-1.5 h-full text-sm w-10/12 focus:outline-none rounded-md text-white ${theme == 'light' ? '' : ''} bg-inherit`}
        />
        <button 
          onClick={handleMessage}
          className="flex-none w-12 hover:bg-opacity-40 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-white text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
      </div>
    </section>
  )
}