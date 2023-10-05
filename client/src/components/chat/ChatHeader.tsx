import { ChatOption, Theme } from '../../posts';
import { FriendsModal } from './head/FriendsModal';
import { ErrorResponse, UserFriends, UserProps } from '../../data';

type ChatHeaderProp={
  theme: Theme,
  isLoading: boolean,
  friends: UserFriends[],
  errorMsg: ErrorResponse,
  showFriends: ChatOption,
  currentUser: Partial<UserProps>,
  setOpenChat: React.Dispatch<React.SetStateAction<ChatOption>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export default function ChatHeader({ theme, friends, isLoading, errorMsg, currentUser, showFriends, setShowFriends, setOpenChat }: ChatHeaderProp) {
  console.log(friends)

  return (
    <header className={`flex-none text-white h-10 shadow-lg w-full sticky top-0`}>
    
      <div className={`flex items-center justify-between relative w-full p-2 pr-0.5 h-full`}>
        <div className='relative flex items-center gap-2'>
          <figure className={`rounded-full border border-white bg-slate-700 w-8 h-8 shadow-lg`}>
            <img 
              src={currentUser?.displayPicture?.photo} 
              alt={`${currentUser?.firstName}_dp`} 
              className='h-full w-full object-cover rounded-full mr-2'
            />
          </figure>

          <button 
            onClick={() => setShowFriends(prev => (prev === 'Hide' ? prev = 'Open' : prev = 'Hide'))}
            className={`${showFriends === 'Open' ? 'bg-slate-700' : 'bg-slate-600'} rounded-sm text-xs p-1 hover:opacity-90 focus:outline-none bg-inherit transition-all`}>
            Friends
          </button>
        </div>

        <FriendsModal
          isLoading={isLoading} errorMsg={errorMsg}
          theme={theme} friends={friends} showFriends={showFriends}
        />

        <button 
          onClick={() => setOpenChat('Hide')}
          className='shadow-lg text-white border border-slate-700 bg-opacity-40 bg-slate-900 cursor-pointer py-0.5 px-1 rounded-md text-sm hover:bg-slate-600 transition-all active:bg-slate-700'>
          close
        </button>
      </div>

    </header>
  )
}
