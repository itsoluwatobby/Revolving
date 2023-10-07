import { useEffect } from 'react';
import { format } from 'timeago.js';
import { Socket } from 'socket.io-client';
import { FriendsModal } from './head/FriendsModal';
import { reduceLength } from '../../utils/navigator';
import { usePostContext } from '../../hooks/usePostContext';
import { ErrorResponse, TypingObjType, UserFriends, UserProps } from '../../data';
import { ChatOption, GetConvoType, PostContextType, Theme, } from '../../posts';

type ChatHeaderProp={
  theme: Theme,
  socket: Socket,
  isLoading: boolean,
  friends: UserFriends[],
  errorMsg: ErrorResponse,
  showFriends: ChatOption,
  currentChat: GetConvoType
  currentUser: Partial<UserProps>,
  setOpenChat: React.Dispatch<React.SetStateAction<ChatOption>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export default function ChatHeader({ theme, friends, socket, currentChat, isLoading, errorMsg, currentUser, showFriends, setShowFriends, setOpenChat }: ChatHeaderProp) {
  const { typingObj, setTypingObj } = usePostContext() as PostContextType
  // console.log(currentChat)
console.log(typingObj)

  useEffect(() => {
    let isMounted = true
    if(isMounted) socket.on('typing_event', (typingRes: TypingObjType) => setTypingObj(typingRes))
    if(isMounted) socket.on('typing_event_ended', (typingRes: TypingObjType) => setTypingObj(typingRes))
    return () => {
      isMounted = false
    }
  }, [socket, setTypingObj])
  
  // useEffect(() => {
  //   let isMounted = true
  //   return () => {
  //     isMounted = false
  //   }
  // }, [socket, setTypingObj])

  return (
    <header className={`flex-none text-white rounded-md h- shadow-lg w-full sticky top-0 ${theme === 'light' ? '' : 'bg-slate-800'}`}>
    
      <div className={`flex items-center justify-between relative w-full p-1.5 pb-0
      5 pr-0.5 h-full`}>

        <div className='relative flex flex-col gap-0.5'>
          <figure className={`rounded-full border border-white bg-slate-700 w-8 h-8 shadow-lg`}>
            <img 
              src={currentChat?.displayPicture} 
              alt={`${currentChat?.firstName}_dp`} 
              className='h-full w-full object-cover rounded-full mr-2'
              />
          </figure>

          <div className={`${currentChat?._id ? 'flex' : 'hidden'} gap-2 items-center text-white`}>
            <p className='text-[11px] text-gray-200'>{reduceLength(currentChat?.lastMessage?.message, 10)}</p>
            <p 
              className={`text-[11px] ${theme === 'light' ? 'text-gray-100' : 'text-gray-100'}`}>
                {currentChat?.status === 'online' ? <span className="before:content-[' '] before:bg-green-500 flex items-baseline gap-0.5 before:rounded-full before:left-0 before:w-2 before:h-2">online</span> : <span className='text-[11px] opacity-90'>{format(currentChat?.lastSeen)}</span>}
            </p>
          </div>

        </div>

        <FriendsModal
          isLoading={isLoading} errorMsg={errorMsg} currentUser={currentUser} typingObj={typingObj}
          theme={theme} friends={friends} showFriends={showFriends} setShowFriends={setShowFriends}
        />

        <div className='flex items-center gap-3'>  

          <button 
            onClick={() => setShowFriends(prev => (prev === 'Hide' ? prev = 'Open' : prev = 'Hide'))}
            className={`${showFriends === 'Open' ? 'bg-slate-600' : 'bg-slate-400'} rounded-sm text-xs p-1 hover:opacity-90 focus:outline-none bg-inherit transition-all`}>
            Friends
          </button>
          <button 
            onClick={() => setOpenChat('Hide')}
            className='shadow-lg text-white border border-slate-700 bg-opacity-40 bg-slate-900 cursor-pointer py-0.5 px-1 rounded-md text-sm hover:bg-slate-600 transition-all active:bg-slate-700'>
            close
          </button> 

        </div>

      </div>

    </header>
  )
}
