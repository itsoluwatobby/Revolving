import { format } from 'timeago.js';
import { Theme, ThemeContextType } from '../../../posts'
import { UserFriends } from '../../../data'
import { useThemeContext } from '../../../hooks/useThemeContext';

type FriendsRecentsProps = {
  friends: UserFriends[]
}

export const FriendsRecents = ({ friends }: FriendsRecentsProps) => {
  const { theme, currentChat, setCurrentChat } = useThemeContext() as ThemeContextType

  return (
    <>
      { 
        friends?.map(user => (
          <article 
            key={user?._id}
            onClick={() => setCurrentChat(user)}
            className={`p-1 shadow-md flex w-full ${currentChat?._id === user?._id ? 'bg-slate-400' : ''} ${theme === 'light' ? 'bg-slate-100 text-black' : 'bg-slate-700'} gap-x-2 rounded-md cursor-pointer hover:bg-gray-200 transition-all`}
          >

            <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-8 h-8">
              {
                user?.displayPicture ? 
                <img src={user?.displayPicture} alt="" 
                  className="w-full h-full rounded-full object-cover" loading='eager'
                /> 
                : null
              }
            </figure>

            <div className='flex-auto flex flex-col'>
              <p className=''>{user?.firstName} {user?.lastName}
              </p>
              <p 
                className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  {user?.status === 'online' ? <span className="before:content-[' '] before:bg-green-500 flex items-baseline gap-0.5 before:rounded-full before:left-0 before:w-2 before:h-2">online</span> : <span className='text-[11px] opacity-90'>{format(user?.lastSeen)}</span>}
              </p>
      
            </div>

          </article>
        ))
      }
    </>
  )
}