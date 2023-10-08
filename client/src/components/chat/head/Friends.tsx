import { useState } from 'react';
import { format } from 'timeago.js';
import { ErrorContent } from '../../ErrorContent';
import { ErrorResponse, UserFriends, UserProps } from '../../../data'
import { IsLoadingSpinner } from '../../IsLoadingSpinner';
import { ChatOption, ThemeContextType } from '../../../posts'
import { useThemeContext } from '../../../hooks/useThemeContext';
import { useCreateConversationMutation } from '../../../app/api/messageApiSlice';

type FriendsProps = {
  friends: UserFriends[],
  currentUser: Partial<UserProps>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export const Friends = ({ friends, currentUser, setShowFriends }: FriendsProps) => {
  const { theme, currentChat, setCurrentChat } = useThemeContext() as ThemeContextType
  const [createConversation, {isLoading}] = useCreateConversationMutation()
  const [errorMsg, setErrorMsg] = useState<ErrorResponse>()

  const newConversation = (partnerId: string) => {
    if(isLoading) return
    createConversation({userId: currentUser?._id as string, partnerId}).unwrap()
    .then((res) => {
      setCurrentChat(res?.data)
      setShowFriends('Hide')
    })
    .catch(error => setErrorMsg(error))
  }

  return (
    <>
      { 
        friends?.map(user => (
          <article 
            key={user?._id}
            onClick={() => newConversation(user?._id)}
            className={`p-1 shadow-md flex w-full ${currentChat?._id === user?._id ? 'bg-slate-400' : ''} ${theme === 'light' ? 'bg-slate-100 text-black hover:bg-gray-200' : 'bg-slate-700 hover:bg-gray-600'} gap-x-2 rounded-md cursor-pointer transition-all`}
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
              <p className=''>
                {
                  (user?.firstName || user?.lastName) 
                  ? `${user?.firstName} ${user?.lastName}` : user?.email
                }
              </p>
              <p 
                className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  {user?.status === 'online' ? <span className="before:content-[' '] before:bg-green-500 flex items-baseline gap-0.5 before:rounded-full before:left-0 before:w-2 before:h-2">online</span> : <span className='text-[11px] opacity-90'>{format(user?.lastSeen)}</span>}
              </p>
      
            </div>

          </article>
        ))
      }
      <ErrorContent 
        message={errorMsg?.message as string} position='CHAT' 
        errorMsg={errorMsg as ErrorResponse} contentLength={friends?.length } 
      />
      {isLoading ? <IsLoadingSpinner page='CHAT' customSize='LARGE' /> : null}
    </>
  )
}