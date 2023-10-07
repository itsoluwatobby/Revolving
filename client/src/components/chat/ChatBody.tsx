import { useState, useEffect } from 'react';
import ChatBodyComp from './body/ChatBodyComp';
import { ErrorContent } from '../ErrorContent';
import { ChatOption, ThemeContextType } from '../../posts';
import { useThemeContext } from '../../hooks/useThemeContext';
import { useGetAllMessagesQuery } from '../../app/api/messageApiSlice';
import { ErrorResponse, MessageModelType, UserProps } from '../../data';
import { Socket } from 'socket.io-client';

type ChatBodyProp={
  socket: Socket,
  currentUser: Partial<UserProps>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

const DELAY = 250 as const

export default function ChatBody({ currentUser, socket, setShowFriends }: ChatBodyProp) {
  const { theme, isConversationState, currentChat, openChat } = useThemeContext() as ThemeContextType
  const [message, setMessage] = useState<MessageModelType>()
  const [messages, setMessages] = useState<MessageModelType[]>()
  const { data, isLoading, error, isError } = useGetAllMessagesQuery(currentChat?._id)

  console.log(currentChat)
  console.log(messages)

  useEffect(() => {
    let isMounted = true
    if(isMounted && data?.length) setMessages([...data])
    return () => {
      isMounted = false
    }
  }, [currentChat?._id, data])

  useEffect(() => {
    // let isMounted = true
    // if(isMounted) {
    socket.on('receive_message', (newMessage: {data: MessageModelType}) => {
      console.log(newMessage?.data)
      setMessages(prev => ([...prev as MessageModelType[], newMessage?.data]))
    })
    // }
    // return () => {
    //   isMounted = false
    // }
  }, [])
 
  const chatContent = (
    messages?.length ?
    messages?.map(msg => (
      <ChatBodyComp key={msg?._id} 
        currentUser={currentUser} message={msg} currentChat={currentChat}
      />
    ))
    :
    <ErrorContent 
      message={currentChat?._id ? 'Start a conversation' : (isConversationState?.msg ?? isConversationState?.error)} 
      contentLength={(messages as MessageModelType[])?.length} 
      position='MESSAGE' errorMsg={error as ErrorResponse} 
    />
  )

  return (
    <section 
      onClick={() => setShowFriends('Hide')}
      className={`hidebars text-sm flex-auto flex flex-col gap-2.5 text-white w-full box-border ${theme == 'light' ? '' : 'bg-slate-600'} overflow-y-scroll py-2.5 pl-0.5 pr-0.5`}>
      {
        isLoading ?
        <p className='animate-pulse m-auto'>Loading your messages...</p>
        :
        chatContent
      }
    </section>
  )
}