import { format } from 'timeago.js';
import { Socket } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { ErrorContent } from '../../ErrorContent';
import { reduceLength } from '../../../utils/navigator';
import { IsLoadingSpinner } from '../../IsLoadingSpinner';
import { useThemeContext } from '../../../hooks/useThemeContext';
import { ChatOption, ThemeContextType } from '../../../types/posts'
import { ErrorResponse, UserFriends, UserProps } from '../../../types/data'
import { useCreateConversationMutation } from '../../../app/api/messageApiSlice';

type FriendsProps = {
  socket: Socket,
  friends: UserFriends[],
  currentUser: Partial<UserProps>,
  setPrevChatId: React.Dispatch<React.SetStateAction<string[]>>,
  setShowFriends: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export const Friends = ({ socket, friends, currentUser, setPrevChatId, setShowFriends }: FriendsProps) => {
  const { theme, currentChat, setCurrentChat } = useThemeContext() as ThemeContextType
  const [createConversation, {isLoading, isError}] = useCreateConversationMutation()
  const [errorMsg, setErrorMsg] = useState<ErrorResponse>()

  const newConversation = (partnerId: string) => {
    if(isLoading) return
    createConversation({userId: currentUser?._id as string, partnerId}).unwrap()
    .then((conversation) => {
      setCurrentChat(conversation?.data)
      setPrevChatId(prev => (prev?.includes(conversation?.data?._id) ? [...prev] : [...prev, conversation?.data?._id]))
      setShowFriends('Hide')
      if(conversation?.data?.isOpened) socket.emit('conversation_opened', {
        conversationId: conversation?.data?._id, isOpened: conversation?.data?.isOpened
      })
    })
    .catch(error => setErrorMsg(error))
  }

  useEffect(() => {
    let isMounted = true, timeoutId: NodeJS.Timeout;
    if(isMounted && errorMsg?.status){
      timeoutId = setTimeout(() => {
        setErrorMsg(undefined)
      }, 5000);
    }
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [isError, errorMsg?.status])

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
                      ? `${reduceLength(user?.firstName, 12)} ${reduceLength(user?.lastName, 10)}` 
                          : reduceLength(user?.email as string, 15)
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
        // setErrorMsg={setErrorMsg}
        message={(errorMsg?.message as string) ?? 'An Error occured'} position='CHAT' 
        errorMsg={errorMsg as ErrorResponse} contentLength={friends?.length } 
      />
      {isLoading ? <IsLoadingSpinner page='CHAT' customSize='LARGE' /> : null}
    </>
  )
}