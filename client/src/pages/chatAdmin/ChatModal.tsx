import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import ChatBody from "../../components/chat/ChatBody";
import ChatBase from "../../components/chat/ChatBase";
import { ErrorResponse, UserFriends } from "../../data";
import ChatHeader from "../../components/chat/ChatHeader";
import { ChatOption, ThemeContextType } from "../../posts";
import { useThemeContext } from "../../hooks/useThemeContext"
import { getCurrentUser } from "../../features/auth/userSlice";
import { useGetUserFriendsQuery } from "../../app/api/usersApiSlice";

export default function ChatModal() {
  const { theme, openChat, setOpenChat } = useThemeContext() as ThemeContextType;
  const [input, setInput] = useState<string>('')
  const currentUser = useSelector(getCurrentUser)
  const [friends, setFriends] = useState<UserFriends[]>()
  const [showFriends, setShowFriends] = useState<ChatOption>('Hide')
  // let userData: GetFollowsType | undefined, loading: boolean, errors: any
  // if(currentUser?._id){
    const { data, isLoading, error } = useGetUserFriendsQuery(currentUser?._id as string)
  //   userData = data, loading = isLoading, errors = error
  // }  
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>(null)

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
    <section className={`fixed right-1 bottom-2 flex flex-col ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-700 shadow-slate-800'} rounded-md w-64 z-50 p-1 h-80 shadow-2xl`}>
      <main className="relative flex flex-col w-full h-full">
        <ChatHeader 
          theme={theme} currentUser={currentUser} setOpenChat={setOpenChat} 
          friends={friends as UserFriends[]} errorMsg={errorMsg as ErrorResponse}
          isLoading={isLoading} showFriends={showFriends} setShowFriends={setShowFriends}
        />
        <ChatBody 
          setShowFriends={setShowFriends}
          theme={theme} openChat={openChat} currentUser={currentUser} 
        />
        <ChatBase 
          theme={theme} input={input} setInput={setInput} 
        />
      </main>
    </section>
  )
}