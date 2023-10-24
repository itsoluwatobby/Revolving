import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { ErrorContent } from '../../ErrorContent';
import React, { useEffect, useState } from 'react';
import { reduceLength } from '../../../utils/navigator';
import { IsLoadingSpinner } from '../../IsLoadingSpinner';
import { ErrorResponse, UserProps } from '../../../types/data';
import { useThemeContext } from '../../../hooks/useThemeContext';
import { ChatOption, ThemeContextType } from '../../../types/posts'
import { useGetUsersThatLikedStoryQuery } from '../../../app/api/storyApiSlice';

type RecentConversationsProps = {
  storyId: string,
  setViewUsers: React.Dispatch<React.SetStateAction<ChatOption>>
}

export const PostLikes = ({ storyId, setViewUsers }: RecentConversationsProps) => {
  const { theme } = useThemeContext() as ThemeContextType
  const {data, isLoading, isError, error} = useGetUsersThatLikedStoryQuery(storyId)
  const [userLikes, setUserLikes] = useState<UserProps[] | []>([])

  useEffect(() => {
    let isMounted = true
    if(isMounted && data) setUserLikes(data as UserProps[])
    if(isMounted && !data?.length) setUserLikes([])
    return () => {
      isMounted = false
    }
  }, [data])

  return (
    <div className={`absolute flex flex-col p-1 gap-0.5 z-10 rounded-md w-60 min-h-[6rem] max-h-80 ${theme === 'light' ? 'bg-slate-500' : 'bg-slate-900'}`}>

      <div className={`flex items-center justify-between text-white ${theme === 'light' ? 'bg-slate-500' : 'bg-slate-900'} p-0.5 transition-colors`}>
        <p className='underline underline-offset-2'>Likes</p>
        <button 
          onClick={() => setViewUsers('Hide')}
          className='z-10 rounded-sm px-1 py-0.5 bg-slate-600 text-white'>
          close
        </button>
      </div>

      <div className='hidebars mt-1 flex flex-col w-full h-full transition-all overflow-y-scroll'>
      { 
        userLikes?.map(user => (
          <article 
            key={user?._id}
            className={`p-1 shadow-md flex w-full ${theme === 'light' ? 'bg-slate-100 hover:bg-gray-200 text-black' : 'bg-slate-700 hover:bg-gray-600'} gap-x-2 rounded-md cursor-pointer transition-all`}
          >

            <figure className="bg-slate-300 rounded-full border-2 border-slate-400 w-8 h-8">
              {
                user?.displayPicture?.photo ? 
                <img src={user?.displayPicture?.photo} alt="" 
                  className="w-full h-full rounded-full object-cover" loading='eager'
                /> 
                : null
              }
            </figure>

            <div className='flex-auto flex flex-col'>
              <Link to={`/profile/${user?._id}`} className='hover:underline underline-offset-2'>
                {
                  (user?.firstName || user?.lastName) 
                  ? `${reduceLength(user?.firstName, 12)} ${reduceLength(user?.lastName, 10)}` : reduceLength(user?.email, 15)
                }
              </Link>
              <div className='flex items-center gap-1.5'>
                <p 
                  className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  <span className='text-[11px] opacity-90'>{format(user?.lastSeen)}</span>
                </p>
              </div>
      
            </div>

          </article>
        ))
      }
      </div>

      {isLoading ? <IsLoadingSpinner page='CHAT' customSize='LARGE' /> : null}
      {isError ? <ErrorContent 
        message={(error as ErrorResponse)?.originalStatus === 401 ? 'Session Ended' : 'An Error occured'} position='POST' 
        errorMsg={error as ErrorResponse} contentLength={userLikes?.length } 
      /> : null}
    </div>
  )
}