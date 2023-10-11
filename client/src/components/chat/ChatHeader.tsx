import { useEffect } from 'react';
import { format } from 'timeago.js';
import { Socket } from 'socket.io-client';
import { CiSearch } from 'react-icons/ci';
import { FriendsModal } from './head/FriendsModal';
import { usePostContext } from '../../hooks/usePostContext';
import { ChatOption, GetConvoType, PostContextType, Theme, } from '../../posts';
import { ErrorResponse, SearchStateType, TypingObjType, UserFriends, UserProps } from '../../data';

type ChatHeaderProp={
  theme: Theme,
  socket: Socket,
  isLoading: boolean,
  friends: UserFriends[],
  errorMsg: ErrorResponse,
  showFriends: ChatOption,
  currentChat: GetConvoType,
  messageState: SearchStateType,
  currentUser: Partial<UserProps>,
  setPrevChatId: React.Dispatch<React.SetStateAction<string[]>>,
  setOpenChat: React.Dispatch<React.SetStateAction<ChatOption>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
  setMessageState: React.Dispatch<React.SetStateAction<SearchStateType>>,
}

export default function ChatHeader({ 
  theme, friends, socket, setPrevChatId, currentChat, isLoading, errorMsg, currentUser, showFriends, messageState, setMessageState, setShowFriends, setOpenChat 
}: ChatHeaderProp) {
  const { typingObj, setTypingObj } = usePostContext() as PostContextType

  const { openSearch, search } = messageState

  useEffect(() => {
    let isMounted = true
    if(isMounted) socket.on('typing_event', (typingRes: TypingObjType) => setTypingObj(typingRes))
    if(isMounted) socket.on('typing_event_ended', (typingRes: TypingObjType) => setTypingObj(typingRes))
    return () => {
      isMounted = false
    }
  }, [socket, setTypingObj])

  return (
    <header className={`z-10 flex-none text-white rounded-md h- shadow-lg w-full sticky top-0 ${theme === 'light' ? '' : 'bg-slate-800'}`}>
    
      <div className={`relative flex items-center justify-between w-full p-1.5 pb-1 pr-0.5 h-full`}>

        <div className='relative flex flex-col gap-0.5'>

          <div className='flex items-end gap-2'>
            <figure className={`rounded-full border border-white bg-slate-700 w-8 h-8 shadow-lg`}>
              <img 
                src={currentChat?.displayPicture} 
                alt={`${currentChat?.firstName}_dp`} 
                className='h-full w-full object-cover rounded-full mr-2'
                />
            </figure>

            <p 
              className={`${currentChat?._id ? 'block' : 'hidden'} text-[11px] ${theme === 'light' ? 'text-gray-100' : 'text-gray-100'}`}>
                {
                  currentChat?.status === 'online' ? 
                    <span className="before:content-[' '] before:bg-green-500 flex items-baseline gap-0.5 before:rounded-full before:left-0 before:w-2 before:h-2">online</span> 
                  : 
                    <span className='text-[11px] opacity-90'>{format(currentChat?.lastSeen)}</span>}
            </p>
          </div>

          {
            typingObj?.conversationId === currentChat?._id ? (
              (typingObj?.userId !== currentChat?.userId && typingObj?.status)
                ? <p className='text-[10px] text-gray-200'>{typingObj?.firstName} is typing</p> : null
            )
            : null
          }

        </div>

        <FriendsModal
          showFriends={showFriends} setShowFriends={setShowFriends}
          isLoading={isLoading} errorMsg={errorMsg} currentUser={currentUser} 
          typingObj={typingObj} theme={theme} friends={friends} setPrevChatId={setPrevChatId}
        />

        <div className='flex items-center gap-3'> 

          <button 
            title='search'
            onClick={() => setMessageState(prev => ({...prev, search: '', openSearch: !openSearch}))}
            className={`flex-none w-5 h-5 p-0.5 ${showFriends === 'Open' ? 'scale-0' : 'scale-100'} ${theme === 'light' ? 'bg-slate-700 hover:bg-gray-600' : 'bg-slate-800 hover:bg-gray-700'} ${openSearch ? 'bg-slate-950' : ''} grid place-content-center rounded-sm transition-all`}>
            <CiSearch className='text-white text-base font-bold'/>
          </button>

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

        <div className={`absolute rounded-sm left-0 w-full ${(openSearch && showFriends === 'Hide') ? 'slide_on' : ' opacity-30 slide_off '} h-5 transition-all rounded-b-sm ${theme === 'light' ? 'bg-slate-400' : 'bg-slate-700'}`}>
          <input 
            type="text" 
            value={search}
            autoComplete="off"
            autoFocus={true}
            placeholder="search message"
            onChange={event => setMessageState(prev => ({...prev, search: event.target.value}))}
            className={`w-full h-full rounded-b-sm bg-inherit text-[13px] py-2 border-0 focus:outline-none ${theme === 'light' ? 'placeholder:text-gray-600' : 'placeholder:text-gray-400'} px-2`} 
          />
        </div>

      </div>

    </header>
  )
}
