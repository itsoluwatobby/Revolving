import { format } from 'timeago.js';
import { reduceLength } from '../../../utils/navigator';
import { IsLoadingSpinner } from '../../IsLoadingSpinner';
import { useThemeContext } from '../../../hooks/useThemeContext';
import { ChatOption, GetConvoType, ThemeContextType } from '../../../posts'
import { useGetCurrentConversationMutation } from '../../../app/api/messageApiSlice';

type RecentConversationsProps = {
  friends: GetConvoType[],
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export const RecentConversations = ({ friends, setShowFriends }: RecentConversationsProps) => {
  const { theme, currentChat, setCurrentChat, setIsConversationState } = useThemeContext() as ThemeContextType
  const [getConversation, {isLoading, isError}] = useGetCurrentConversationMutation()

  const fetchConversation = (userId: string, convoId: string) => {
    if(isLoading) return
    getConversation({userId, conversationId: convoId as string}).unwrap()
    .then((conversation) => {
      setCurrentChat(conversation)
      setShowFriends('Hide')
    })
    .catch((error) => setIsConversationState(prev => ({...prev, error, isError})))
  }

  return (
    <>
      { 
        friends?.map(user => (
          <article 
            key={user?._id}
            onClick={() => fetchConversation(user?.userId, user?._id)}
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
              <div className='flex items-center gap-1.5'>
                <p>{reduceLength(user?.lastMessage?.message, 10)}</p>
                <p 
                  className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                    {user?.status === 'online' ? <span className="before:content-[' '] before:bg-green-500 flex items-baseline gap-0.5 before:rounded-full before:left-0 before:w-2 before:h-2">online</span> : <span className='text-[11px] opacity-90'>{format(user?.lastSeen)}</span>}
                </p>
              </div>
      
            </div>

          </article>
        ))
      }
      {isLoading ? <IsLoadingSpinner page='CHAT' customSize='LARGE' /> : null}
    </>
  )
}