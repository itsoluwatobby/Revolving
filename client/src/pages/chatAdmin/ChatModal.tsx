import { useState, useEffect } from "react";
import ChatBase from "../../components/chat/ChatBase";
import ChatBody from "../../components/chat/ChatBody";
import ChatHeader from "../../components/chat/ChatHeader";
import { usePostContext } from "../../hooks/usePostContext";
import { useThemeContext } from "../../hooks/useThemeContext";
import { ErrorResponse, UserFriends, UserProps } from "../../data";
import { useGetUserFriendsQuery } from "../../app/api/usersApiSlice";
import { useGetCurrentConversationMutation } from "../../app/api/messageApiSlice";
import { ChatOption, GetConvoType, PostContextType, ThemeContextType } from "../../posts";
import { Socket } from "socket.io-client";

type ChatModalProp = {
  socket: Socket
}

export default function ChatModal({ socket }: ChatModalProp) {
  const { theme, openChat, setOpenChat, currentChat, setCurrentChat, setIsConversationState } = useThemeContext() as ThemeContextType;
  const { currentUser } = usePostContext() as PostContextType
  const userId = localStorage.getItem('revolving_userId') as string
  const [friends, setFriends] = useState<UserFriends[]>()
  const [showFriends, setShowFriends] = useState<ChatOption>('Hide')
  const [getConversation, {isLoading: loadingCurrent, isError}] = useGetCurrentConversationMutation()
  const { data, isLoading, error } = useGetUserFriendsQuery(userId)  
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)

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
      if(!currentUser?.lastConversationId) return setIsConversationState(prev => ({...prev, isLoading: loadingCurrent, isError, msg: 'You have no recent conversation'}))
      getConversation({userId, conversationId: currentUser?.lastConversationId as string}).unwrap()
      .then((conversation) => {
        console.log(conversation)  
        setCurrentChat(conversation)
      })
      .catch((error) => setIsConversationState(prev => ({...prev, isLoading: loadingCurrent, isError, error})))
    }
    if(isMounted) getCurrentUser()
    return () => {
      isMounted = false
    }
  }, [userId, currentUser?.lastConversationId, loadingCurrent, isError, setIsConversationState, setCurrentChat, getConversation])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && data) {
      setFriends([...data])
    }
    return () => {
      isMounted = false
    }
  }, [data])

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  return (
    <section className={`${openChat === 'Open' ? 'fixed flex h-[23rem] w-[19rem]' : 'scale-0 w-0'} transition-all right-1 bottom-2 flex-col ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-700 shadow-slate-800'} rounded-md z-50 p-1 shadow-2xl`}>
      <main className="relative flex flex-col w-full h-full">
        <ChatHeader 
          currentChat={currentChat}
          friends={friends as UserFriends[]} errorMsg={errorMsg as ErrorResponse}
          isLoading={isLoading} showFriends={showFriends} setShowFriends={setShowFriends}
          theme={theme} currentUser={currentUser as Partial<UserProps>} setOpenChat={setOpenChat} socket={socket}
        />
        <ChatBody 
          setShowFriends={setShowFriends} socket={socket}
          currentUser={currentUser as Partial<UserProps>} 
        />
        <ChatBase 
          currentUser={currentUser as Partial<UserProps>}
          theme={theme} currentChat={currentChat} socket={socket}
        />
      </main>
    </section>
  )
}