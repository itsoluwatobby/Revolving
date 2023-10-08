import { BsSend } from 'react-icons/bs';
import { Socket } from 'socket.io-client';
import { ResponseBody } from './ResponseBody';
import { GetConvoType, Theme } from '../../posts';
import { useEffect, useState, useRef } from 'react';
import { useDelayedInput } from '../../hooks/useDelayedInput';
import { ErrorResponse, MessageModelType, UserProps } from '../../data';
import { useCreateMessageMutation, useEditMessageMutation } from '../../app/api/messageApiSlice';

type ChatBaseProp={
  theme: Theme,
  socket: Socket,
  currentChat: GetConvoType,
  messages: MessageModelType[],
  editMessage: MessageModelType,
  currentUser: Partial<UserProps>,
  messageResponse: MessageModelType,
  // setMessages: React.Dispatch<React.SetStateAction<MessageModelType[]>>
  setMessageResponse: React.Dispatch<React.SetStateAction<MessageModelType | null>>
}

export default function ChatBase({ theme, socket, currentChat, messages, editMessage, currentUser, messageResponse, setMessageResponse }: ChatBaseProp) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState<string>('')
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [createMessage, { isError, isLoading }] = useCreateMessageMutation()
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [editSingleMessage, {isError: isEditError, isLoading: isEditLoading}] = useEditMessageMutation()
  const delayedInput = useDelayedInput(input, 750)

  useEffect(() => {
    if(inputRef.current) inputRef?.current.focus()
  }, [messageResponse?._id,  editMessage?._id])

  useEffect(() => {
    let isMounted = true, timeoutId: NodeJS.Timeout;
    if(isMounted && (isError || isEditError)){
      timeoutId = setTimeout(() => {
        setErrorMsg('')
      }, 5000)
    }
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [isError, isEditError])

  useEffect(() => {
    let isMounted = true
    if(isMounted && editMessage?._id) setInput(editMessage?.message)
    else if(isMounted && !editMessage?._id) setInput('')
    return () => {
      isMounted = false
    }
  }, [editMessage?._id, editMessage?.message])

  useEffect(() => {
    if(!currentUser) return
    const { firstName } = currentUser
    if(delayedInput?.typing === 'typing') {
      socket.emit('is_typing', { firstName, userId: currentChat?.userId, conversationId: currentChat?._id })
    }
    else if(delayedInput?.typing === 'notTyping'){
      socket.emit('typing_stopped', { firstName, userId: currentChat?.userId, conversationId: currentChat?._id })
    }
  }, [delayedInput.typing, socket, currentChat?._id, currentChat?.userId, currentUser])
  
  const handleMessage = async() => {
    if(!input.length || isLoading || isEditLoading) return
    try{
      let messageReply = {} as Omit<MessageModelType, "referencedMessage">
      if(messageResponse){
        const { referencedMessage, ...rest } = messageResponse
        messageReply = rest
      }
      if(!editMessage?._id){
        const newMessage = { 
          message: input, senderId: currentUserId, receiverId: currentChat?.userId,  
          conversationId: currentChat?._id, referencedMessage: messageReply
        } as Partial<MessageModelType>
        const res = await createMessage(newMessage).unwrap() as unknown as { data: MessageModelType}
        setInput('')
        socket.emit('create_message', res?.data, async(acknowledgement: any) => {
          console.log(acknowledgement)
        })
      }
      else{
        const edittedMessage: MessageModelType = { 
          ...editMessage, message: input, edited: true, 
          referencedMessage: messageReply
        };
        setInput('')
        await editSingleMessage({userId: editMessage?.senderId, messageObj: edittedMessage}).unwrap()
        socket.emit('edit_message', {isEdited: true, conversationId: currentChat?._id})
      }
      // setMessages(prev => ([...prev, res?.data]))
    }
    catch(err){
      const errors = err as ErrorResponse
      setErrorMsg(errors?.data?.meta?.message as string)
    }
  }

  return (
    <section
      onKeyUpCapture={event => event.key === 'Enter' ? handleMessage() : ''}
      className='relative'
    >
      <div
        className={`flex-none relative w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-700' : 'bg-slate-800'}`}>
        <div className={`absolute -top-8 ${errorMsg?.length ? 'scale-100' : 'scale-0'} transition-all bg-red-400 shadow-inner shadow-red-500 border-2 border-red-300 rounded-sm p-1 w-[95%] left-2 text-[12px] text-center text-white whitespace-pre-wrap`}>{errorMsg}</div>
        <input 
          type="text"
          ref={inputRef}
          value={input}
          autoComplete="off"
          placeholder={!messages?.length ? "Say hello" : 'Enter message'}
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

      {
        messageResponse?._id ? 
          <ResponseBody message={messageResponse} 
            setMessageResponse={setMessageResponse} 
          /> 
          : null
      }

    </section>
  )
}