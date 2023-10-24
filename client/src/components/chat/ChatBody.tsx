import { Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import ChatBodyComp from './body/ChatBodyComp';
import { ErrorContent } from '../ErrorContent';
import { useThemeContext } from '../../hooks/useThemeContext';
import { ChatOption, ThemeContextType } from '../../types/posts';
import { messageApiSlice, useGetAllMessagesQuery } from '../../app/api/messageApiSlice';
import { ErrorResponse, MessageModelType, MessageStatusType, SearchStateType, UserProps } from '../../types/data';


type ChatBodyProp={
  socket: Socket,
  messages: MessageModelType[],
  editMessage: MessageModelType,
  messageState: SearchStateType,
  currentUser: Partial<UserProps>,
  setEditMessage: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
  setMessages: React.Dispatch<React.SetStateAction<MessageModelType[]>>,
  setMessageResponse: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
}

export default function ChatBody({ currentUser, messages, messageState, editMessage, socket, setEditMessage, setMessages, setMessageResponse, setShowFriends }: ChatBodyProp) {
  const { theme, isConversationState, currentChat } = useThemeContext() as ThemeContextType
  const { data, isLoading, error } = useGetAllMessagesQuery(currentChat?._id)
  const [message, setMessage] = useState<MessageModelType>();
  const [filteredMessages, setFilteredMessages] = useState<MessageModelType[]>()
  const dispatch = useDispatch()
  
  useEffect(() => {
    let isMounted = true
    if(isMounted) setFilteredMessages(messages?.filter(msg => (msg?.message?.toLowerCase())?.includes(messageState?.search?.toLowerCase())))
    return () => {
      isMounted = false
    }
  }, [messageState?.search, messages])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && currentChat?._id && data?.length) setMessages([...data])
    else if(isMounted && currentChat?._id && !data?.length) setMessages([])
    return () => {
      isMounted = false
    }
  }, [currentChat?._id, data, setMessages])

  useEffect(() => {
    let isMounted = true
    if(isMounted) socket.on('receive_message', (newMessage: MessageModelType) => setMessage(newMessage))
    return () => {
      isMounted = false
    }
  }, [socket])

  useEffect(() => {
    let isMounted = true
    if(isMounted && message?.conversationId === currentChat?._id && message?.senderId !== currentUser?._id) {
      setMessages(prev => ([...prev, message as MessageModelType]));
    }
    return () => {
      isMounted = false
    }
  }, [message, currentChat?._id, setMessages, currentUser?._id])

  useEffect(() => {
    let isMounted = true
    if(isMounted) socket.on('isEditted', (isEdited: MessageStatusType) => {
      if(isEdited?.conversationId === currentChat?._id){
        dispatch(messageApiSlice.util.invalidateTags(['MESSAGES']))
      }
    })
    if(isMounted) socket.on('isDeleted', (isDeleted: MessageStatusType) => {
      if(isDeleted?.conversationId === currentChat?._id){
        dispatch(messageApiSlice.util.invalidateTags(['MESSAGES']))
      }
    })
    return () => {
      isMounted = false
    }
  }, [socket, currentChat?._id, dispatch])

  const chatContent = (
    messages?.length > 0 ?
    filteredMessages?.map(msg => (
      <ChatBodyComp key={msg?._id} socket={socket}
      currentUser={currentUser} message={msg} currentChat={currentChat}
      setMessageResponse={setMessageResponse} editMessage={editMessage} setEditMessage={setEditMessage}
      />
    ))
    :
    <ErrorContent 
      position='MESSAGE' errorMsg={currentChat?._id ? {status: 400} as ErrorResponse : error as ErrorResponse} contentLength={messages?.length} 
      message={
        currentChat?._id 
            ? 'Start a conversation' 
              : isConversationState?.error?.originalStatus === 401 ? 'Please login in, session ended' : (isConversationState?.msg ?? isConversationState?.error?.message)} 
    />
  )

  return (
    <section 
      onClick={() => setShowFriends('Hide')}
      className={`hidebars text-sm flex-auto flex flex-col gap-2.5 text-white w-full box-border ${theme == 'light' ? '' : 'bg-slate-600'} overflow-y-scroll pt-0.5 pb-2.5 px-1`}>
      {
        isLoading ?
        <p className='animate-pulse m-auto'>Loading your messages...</p>
        :
        chatContent
      }
    </section>
  )
}