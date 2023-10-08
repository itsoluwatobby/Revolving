import { Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import ChatBodyComp from './body/ChatBodyComp';
import { ErrorContent } from '../ErrorContent';
import { ChatOption, ThemeContextType } from '../../posts';
import { useThemeContext } from '../../hooks/useThemeContext';
import { ErrorResponse, MessageModelType, MessageStatusType, UserProps } from '../../data';
import { messageApiSlice, useGetAllMessagesQuery, useUpdateMessageStatusMutation } from '../../app/api/messageApiSlice';
import { CiSearch } from 'react-icons/ci';


type ChatBodyProp={
  socket: Socket,
  messages: MessageModelType[],
  editMessage: MessageModelType,
  currentUser: Partial<UserProps>,
  setEditMessage: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
  setMessages: React.Dispatch<React.SetStateAction<MessageModelType[]>>,
  setMessageResponse: React.Dispatch<React.SetStateAction<MessageModelType | null>>,
}

const initMessageState = { openSearch: false, search: '' }
export default function ChatBody({ currentUser, messages, editMessage, socket, setEditMessage, setMessages, setMessageResponse, setShowFriends }: ChatBodyProp) {
  const { theme, isConversationState, currentChat } = useThemeContext() as ThemeContextType
  const { data, isLoading, error } = useGetAllMessagesQuery(currentChat?._id)
  const [message, setMessage] = useState<MessageModelType>();
  const [updateMessageStatus] = useUpdateMessageStatusMutation();
  const [messageState, setMessageState] = useState<typeof initMessageState>(initMessageState)
  const [filteredMessages, setFilteredMessages] = useState<MessageModelType[]>()
  const dispatch = useDispatch()

  const { openSearch, search } = messageState

  useEffect(() => {
    let isMounted = true
    if(isMounted) setFilteredMessages(messages?.filter(msg => (msg?.message?.toLowerCase())?.includes(search?.toLowerCase())))
    return () => {
      isMounted = false
    }
  }, [search, messages])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && currentChat?._id && data?.length) setMessages([...data])
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
    if(isMounted && message?.conversationId === currentChat?._id ) {
      setMessages(prev => ([...prev, message as MessageModelType]));
      (async() => {
        await updateMessageStatus({messageId: message?._id, status: 'DELIVERED'})
      })()
    }
    return () => {
      isMounted = false
    }
  }, [message, currentChat?._id, updateMessageStatus, setMessages])

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
    messages?.length ?
    filteredMessages?.map(msg => (
      <ChatBodyComp key={msg?._id} socket={socket}
      currentUser={currentUser} message={msg} currentChat={currentChat}
      setMessageResponse={setMessageResponse} editMessage={editMessage} setEditMessage={setEditMessage}
      />
    ))
    :
    <ErrorContent 
      position='MESSAGE' errorMsg={error as ErrorResponse} contentLength={messages?.length} 
      message={currentChat?._id ? 'Start a conversation' : (isConversationState?.msg ?? isConversationState?.error?.message)} 
    />
  )

  return (
    <section 
      onClick={() => setShowFriends('Hide')}
      className={`hidebars relative text-sm flex-auto flex flex-col gap-2.5 text-white w-full box-border ${theme == 'light' ? '' : 'bg-slate-600'} overflow-y-scroll pt-0.5 pb-2.5 px-1`}>
      
      <button 
        title='search'
        onClick={() => setMessageState(prev => ({...prev, search: '', openSearch: !openSearch}))}
        className={`sticky top-0 self-end z-20 flex-none w-5 h-5 p-0.5 ${theme === 'light' ? 'bg-slate-700 hover:bg-gray-600' : 'bg-slate-800 hover:bg-gray-700'} ${openSearch ? 'bg-opacity-50' : ''} grid place-content-center rounded-sm transition-all`}>
        <CiSearch className='text-white text-base font-bold'/>
      </button>

      <div className={`z-20 w-full ${openSearch ? 'sticky' : 'h-0'} transition-all rounded-b-sm bg-slate-900`}>
        <input 
          type="text" 
          value={search}
          autoComplete="off"
          autoFocus={true}
          placeholder="search message"
          onChange={event => setMessageState(prev => ({...prev, search: event.target.value}))}
          className="w-full h-full rounded-b-sm bg-inherit text-black px-1 border-0 focus:outline-none placeholder:text-gray-600 placeholder:pl-4" 
        />
      </div>

      {
        isLoading ?
        <p className='animate-pulse m-auto'>Loading your messages...</p>
        :
        chatContent
      }
    </section>
  )
}