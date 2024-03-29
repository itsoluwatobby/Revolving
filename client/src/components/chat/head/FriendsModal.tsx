import { Friends } from "./Friends"
import { CiSearch } from "react-icons/ci"
import { Socket } from "socket.io-client"
import { ErrorContent } from "../../ErrorContent"
import { useState, useEffect, useRef } from "react"
import SkeletonChats from "../../skeletons/SkeletonChats"
import { RecentConversations } from "./RecentConversations"
import { ChatOption, GetConvoType, Theme } from "../../../types/posts"
import { useGetConversationsQuery } from "../../../app/api/messageApiSlice"
import { ErrorResponse, TypingObjType, UserFriends, UserProps } from "../../../types/data"

type FriendsModalType = {
  theme: Theme,
  socket: Socket,
  isLoading: boolean,
  friends: UserFriends[],
  showFriends: ChatOption,
  errorMsg: ErrorResponse,
  typingObj: TypingObjType,
  currentUser: Partial<UserProps>,
  setPrevChatId: React.Dispatch<React.SetStateAction<string[]>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

type Option = 'Friends' | 'Recents'
type ChatStateType = {
  toggleView: Option,
  openSearch: ChatOption,
}

const initChatState = { toggleView: 'Friends' as Option, openSearch: 'Hide' as ChatOption }
export const FriendsModal = ({ theme, socket, showFriends, friends, isLoading, errorMsg, currentUser, setShowFriends, setPrevChatId }: FriendsModalType) => {
  const [chatState, setChatState] = useState<ChatStateType>(initChatState)
  const [filteredFriends, setFilteredFriends] = useState<(UserFriends | GetConvoType)[]>([])
  const { data: recentConversations } = useGetConversationsQuery(currentUser?._id as string)
  const [search, setSearch] = useState<string>('')
  const searchRef = useRef<HTMLInputElement>(null)

  const { toggleView, openSearch } = chatState

  useEffect(() => {
    let isMounted = true
    if(isMounted) {
      if(toggleView === 'Friends'){
        setFilteredFriends(friends?.filter(friend => friend?.firstName?.toLowerCase()?.includes(search?.toLowerCase()) || friend?.lastName?.toLowerCase()?.includes(search?.toLowerCase())))
      }
      else if(toggleView === 'Recents'){
        setFilteredFriends((recentConversations as GetConvoType[])?.filter(friend => friend?.firstName?.toLowerCase()?.includes(search?.toLowerCase()) || friend?.lastName?.toLowerCase()?.includes(search?.toLowerCase())))
      }
    }
    return () => {
      isMounted = false
    }
  }, [search, friends, recentConversations, toggleView])

  useEffect(() => {
    if(searchRef?.current) searchRef.current.focus()
  }, [openSearch])
  
  return (
    <div className={`${showFriends === 'Open' ? 'flex' : 'hidden'} flex-col pb-1 text-xs absolute ${theme === 'light' ? 'bg-slate-600' : 'bg-slate-800'} p-0.5 rounded-md top-11 right-4 border-4 border-slate-500 border-t-0 border-r-0 border-l-0 h-48 w-[80%]`}>

      <div className='flex-none flex text-[13px] items-center justify-between border border-b-1 border-t-0 border-r-0 border-l-0 transition-all'>
        <p
          onClick={() => setChatState(prev => ({ ...prev, toggleView: 'Friends' }))} 
          className={`flex-auto ${toggleView === 'Friends' ? 'bg-slate-500' : ''} px-2 p-1 cursor-pointer rounded-sm hover:opacity-90 transition-all text-center  w-full`}>Friends</p>
        <p
          onClick={() => setChatState(prev => ({ ...prev, toggleView: 'Recents' }))} 
          className={`flex-auto ${toggleView === 'Recents' ? 'bg-slate-500' : ''} px-2 p-1 rounded-sm cursor-pointer hover:opacity-90 transition-all w-full text-center`}>Recents</p>
        <button 
          onClick={() => {
            setSearch('')
            setChatState(prev => ({ ...prev, openSearch: openSearch === 'Hide' ? 'Open' : 'Hide' }))
          }}
          className={`flex-none w-5 h-full ${openSearch === 'Open' ? 'bg-slate-500' : ''} grid place-content-center rounded-sm transition-all`}>
          <CiSearch className='text-white text-sm'/>
        </button>
      </div>
      
      <div className={`w-full ${openSearch === 'Open' ? 'h-4' : 'h-0'} transition-all rounded-b-sm bg-slate-300`}>
        <input 
          type="text" 
          ref={searchRef}
          value={search}
          autoComplete="off"
          placeholder="Find user"
          onChange={event => setSearch(event.target.value)}
          className="w-full h-full rounded-b-sm bg-inherit text-black px-1 border-0 focus:outline-none placeholder:text-gray-600 placeholder:pl-4" 
        />
      </div>
      
      <div className={`hidebars relative flex-auto w-full h-full flex flex-col gap-1 p-1.5 overflow-y-scroll transition-all`}>
      {
        isLoading ?
          <SkeletonChats />
        :
          friends?.length ?
            (  
              toggleView === 'Friends' ?
                <Friends 
                  socket={socket}
                  friends={filteredFriends} currentUser={currentUser} 
                  setShowFriends={setShowFriends} setPrevChatId={setPrevChatId}
                />
                :    
                <RecentConversations 
                  socket={socket}
                  setShowFriends={setShowFriends} currentuser={currentUser}
                  friends={filteredFriends as GetConvoType[]} setPrevChatId={setPrevChatId}
                />    
            )
        : <ErrorContent 
            message='Empty list' position='CHAT' 
            errorMsg={errorMsg} contentLength={friends?.length } 
          />
      }
      </div>

    </div>
  )
}
