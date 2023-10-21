import { useDispatch } from "react-redux";
import { Socket } from "socket.io-client";
import { useState, useEffect } from "react";
import ChatBase from "../../components/chat/ChatBase";
import ChatBody from "../../components/chat/ChatBody";
import ChatHeader from "../../components/chat/ChatHeader";
import { usePostContext } from "../../hooks/usePostContext";
import { useThemeContext } from "../../hooks/useThemeContext";
import { useGetUserFriendsQuery } from "../../app/api/usersApiSlice";
import { ChatOption, PostContextType, ThemeContextType } from "../../types/posts";
import { messageApiSlice, useCloseConversationMutation, useGetCurrentConversationMutation } from "../../app/api/messageApiSlice";
import { ConversationStatusType, ErrorResponse, MessageModelType, SearchStateType, UserFriends, UserProps } from "../../types/data";

type ChatModalProp = {
  socket: Socket
}

const initMessageState = { openSearch: false, search: '' }
export default function ChatModal({ socket }: ChatModalProp) {
  const { theme, openChat, setOpenChat, currentChat, setCurrentChat, setIsConversationState } = useThemeContext() as ThemeContextType;
  const [getConversation] = useGetCurrentConversationMutation()
  const [messageResponse, setMessageResponse] = useState<MessageModelType>()
  const [editMessage, setEditMessage] = useState<MessageModelType>()
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)
  const userId = localStorage.getItem('revolving_userId') as string
  const [showFriends, setShowFriends] = useState<ChatOption>('Hide')
  const { data, isLoading, error } = useGetUserFriendsQuery(userId)  
  const [messages, setMessages] = useState<MessageModelType[]>([])
  const { currentUser } = usePostContext() as PostContextType
  const [friends, setFriends] = useState<UserFriends[]>()
  const [messageState, setMessageState] = useState<SearchStateType>(initMessageState)
  const [close_Conversation] = useCloseConversationMutation()
  const [prevChatId, setPrevChatId] = useState<string[]>([])
  const [errors, setErrors] = useState<ErrorResponse>()
  const dispatch = useDispatch()

  // close previous chat
  useEffect(() => {
    let isMounted = true
    if(isMounted && prevChatId?.length === 2){
      close_Conversation({userId, conversationId: prevChatId[0]})
      .then(() => {
        console.log(`previous chat with id ${prevChatId[0]} closed`)
        setPrevChatId([prevChatId[1]])
      })
    }
    return () => {
      isMounted = false
    }
  }, [prevChatId, userId, close_Conversation])

  useEffect(() => {
    let isMounted = true
    if(isMounted && currentChat?._id) socket.emit('start_conversation', currentChat?._id)
    return () => {
      isMounted = false
    }
  }, [currentChat?._id, socket])

  useEffect(() => {
    let isMounted = true
    const getCurrentUser = async() => {
      if(!currentUser?.lastConversationId) return setIsConversationState(prev => (
        {...prev, isLoading: false, isError: true, 
          msg: errors?.status === 'FETCH_ERROR' ?
          'SERVER ERROR' :  errors?.originalStatus === 401 
              ? 'Session ended, Please sign in' : 'You have no recent conversation'
        }))
      getConversation({userId: currentUser?._id, conversationId: currentUser?.lastConversationId}).unwrap()
      .then((conversation) => setCurrentChat(conversation))
      .catch((err) => {
        const error = err as ErrorResponse
        setErrors(error)
        setIsConversationState(prev => ({...prev, isLoading: false, isError: true, error}))
      })
    }
    if(isMounted && !currentChat?._id && errors?.originalStatus !== 401) getCurrentUser()
    return () => {
      isMounted = false
    }
  }, [currentUser?._id, socket, currentUser?.lastConversationId, errors?.status, errors?.originalStatus, setIsConversationState, currentChat?._id, setCurrentChat, getConversation])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && data) setFriends([...data])
    return () => {
      isMounted = false
    }
  }, [data])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted) {
      socket.on('conversation_event', (convoEvent: ConversationStatusType) => {
        if(convoEvent?.conversationId === currentChat?._id && convoEvent?.isOpened){
          dispatch(messageApiSlice.util.invalidateTags(['CONVERSATIONS', 'MESSAGES']))
        }
        else return
      })
    }
    return () => {
      isMounted = false
    }
  }, [socket, dispatch, currentChat?._id])

  useEffect(() => {
    let isMounted = true
    if(isMounted && currentChat?.isOpened) socket.emit('conversation_opened', {
      conversationId: currentChat?._id, isOpened: currentChat?.isOpened
    })
    return () => {
      isMounted = false
    }
  }, [socket, currentChat?.isOpened, currentChat?._id])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  return (
    <section className={`box-border ${openChat === 'Open' ? 'fixed flex h-[23rem] w-[19rem]' : 'scale-0 w-0'} transition-all right-1 bottom-2 flex-col ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-700 shadow-slate-800'} rounded-md z-50 p-1 shadow-2xl`}>
      <main className="relative flex flex-col w-full h-full">
        <ChatHeader 
          currentChat={currentChat} setPrevChatId={setPrevChatId}
          friends={friends as UserFriends[]} errorMsg={errorMsg as ErrorResponse}
          messageState={messageState} setMessageState={setMessageState} socket={socket}
          isLoading={isLoading} showFriends={showFriends} setShowFriends={setShowFriends}
          theme={theme} currentUser={currentUser as Partial<UserProps>} setOpenChat={setOpenChat} 
        />
        <ChatBody 
          messageState={messageState}
          setShowFriends={setShowFriends} messages={messages} setMessages={setMessages} 
          setEditMessage={setEditMessage as React.Dispatch<React.SetStateAction<MessageModelType | null>>} 
          setMessageResponse={setMessageResponse as React.Dispatch<React.SetStateAction<MessageModelType | null>>}
          socket={socket} currentUser={currentUser as Partial<UserProps>} editMessage={editMessage as MessageModelType} 
          />
        <ChatBase 
          // setMessages={setMessages}
          messageResponse={messageResponse as MessageModelType} 
          currentUser={currentUser as Partial<UserProps>} messages={messages}
          theme={theme} currentChat={currentChat} socket={socket} editMessage={editMessage as MessageModelType}
          setEditMessage={setEditMessage as React.Dispatch<React.SetStateAction<MessageModelType | null>>}
          setMessageResponse={setMessageResponse as React.Dispatch<React.SetStateAction<MessageModelType | null>>}
        />
      </main>
    </section>
  )
}