import { format } from 'timeago.js';
import { reduceLength } from '../../../utils/navigator';
import { IsLoadingSpinner } from '../../IsLoadingSpinner';
import { useThemeContext } from '../../../hooks/useThemeContext';
import { ChatOption, GetConvoType, ThemeContextType } from '../../../posts'
import { useGetCurrentConversationMutation } from '../../../app/api/messageApiSlice';
import { UserProps } from '../../../data';
import { Socket } from 'socket.io-client';

type RecentConversationsProps = {
  socket: Socket,
  friends: GetConvoType[],
  currentuser: Partial<UserProps>,
  setPrevChatId: React.Dispatch<React.SetStateAction<string[]>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export const RecentConversations = ({ friends, socket, currentuser, setPrevChatId, setShowFriends }: RecentConversationsProps) => {
  const { theme, currentChat, setCurrentChat, setIsConversationState } = useThemeContext() as ThemeContextType
  const [getConversation, {isLoading, isError}] = useGetCurrentConversationMutation()

  const fetchConversation = (convoId: string) => {
    if(isLoading) return
    getConversation({userId: currentuser?._id as string, conversationId: convoId as string}).unwrap()
    .then((conversation) => {
      setCurrentChat(conversation)
      setPrevChatId(prev => (prev?.includes(convoId) ? [...prev] : [...prev, convoId]))
      setShowFriends('Hide')
      if(conversation?.isOpened) socket.emit('conversation_opened', {
        conversationId: convoId, isOpened: conversation?.isOpened
      })
    })
    .catch((error) => setIsConversationState(prev => ({...prev, error, isError})))
  }

  return (
    <>
      { 
        friends?.map(userConvo => (
          <article 
            key={userConvo?._id}
            onClick={() => fetchConversation(userConvo?._id)}
            className={`p-1 shadow-md flex w-full ${currentChat?._id === userConvo?._id ? 'bg-slate-500' : ''} ${theme === 'light' ? 'bg-slate-100 hover:bg-gray-200 text-black' : 'bg-slate-700 hover:bg-gray-600'} gap-x-2 rounded-md cursor-pointer transition-all`}
          >

            <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-8 h-8">
              {
                userConvo?.displayPicture ? 
                <img src={userConvo?.displayPicture} alt="" 
                  className="w-full h-full rounded-full object-cover" loading='eager'
                /> 
                : null
              }
            </figure>

            <div className='flex-auto flex flex-col'>
                {
                  (userConvo?.firstName || userConvo?.lastName) 
                  ? `${reduceLength(userConvo?.firstName, 12)} ${reduceLength(userConvo?.lastName, 10)}` : reduceLength(userConvo?.email, 15)
                }
              <div className='flex items-center gap-1.5'>
                <p>{reduceLength(userConvo?.lastMessage?.message, 10)}</p>
                <p 
                  className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                    {userConvo?.status === 'online' ? <span className="before:content-[' '] before:bg-green-500 flex items-baseline gap-0.5 before:rounded-full before:left-0 before:w-2 before:h-2">online</span> : <span className='text-[11px] opacity-90'>{format(userConvo?.lastSeen)}</span>}
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