import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TDate, format } from 'timeago.js';
import { NotificationBody } from '../../data';
import { FaTrashRestore } from 'react-icons/fa';
import { ChatOption, Theme } from '../../posts';
import { reduceLength } from '../../utils/navigator';

type FollowsCompProps = { 
  theme: Theme,
  isDeleteLoading: boolean,
  notificationIds: string[],
  notification: NotificationBody,
  deleteNotification: (notification: string) => void,
  setNotificationIds: React.Dispatch<React.SetStateAction<string[]>>
  setOpenNotification: React.Dispatch<React.SetStateAction<ChatOption>>
}

export default function NotificationComp({ notification, theme, isDeleteLoading, notificationIds, deleteNotification, setOpenNotification, setNotificationIds }: FollowsCompProps) {
  const [isMarked, setIsMarked] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    if(isMounted){
      if (isMarked) setNotificationIds(prev => ([...prev, notification?._id]))
      else if (!isMarked) setNotificationIds(prev => (prev?.filter(id => id !== notification?._id)))
    }  
    return () => {
      isMounted = false
    }
  }, [isMarked, setNotificationIds, notification?._id])

  return (   
    <>
      {
        <article 
          className={`${isMarked ? 'bg-slate-300' : ''} ${(notificationIds?.includes(notification?._id) && isDeleteLoading) ? 'animate-pulse' : ''} ${notification?.status === 'read' ? 'opacity-70' : ''} p-1.5 shadow-md flex w-full ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} gap-x-2 rounded-md`}
        >

          <figure className="flex-none bg-slate-300 rounded-full border-2 border-slate-400 w-9 h-9">
            {
              notification?.notify?.displayPicture ? 
                <img src={notification?.notify?.displayPicture as string} alt="" 
                  className="w-full h-full rounded-full object-cover"
                /> 
              : 
              notification?.notify?.picture ? 
                <img src={notification?.notify?.picture as string} alt="" 
                  className="w-full h-full rounded-full object-cover"
                /> 
              : 
              null
            }
          </figure>

          <div 
            onClick={() => setOpenNotification('Hide')}
            className='flex-auto flex flex-col gap-1'>

            <Link to={`/profile/${notification?.notify?.userId}`}>
              <p className={`w-fit ${theme === 'light' ? 'bg-white' : 'text-gray-300'} hover:underline underline-offset-2 cursor-pointer text-sm`}>@{(notification?.notify?.fullName as string)?.replace(' ', '_')?.toLowerCase()}
              </p>
            </Link>

            {/* CONTENT */}
            <Link to={notification?.notify?.title ? `/story/${notification?.notify?.storyId as string}` : `/profile/${notification?.notify?.userId as string}`}
              title='view story'
              className={`w-fit text-[11px] hover:underline ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
              {
                notification?.notificationType === 'Comment' ? 'commented on your story' : notification?.notificationType === 'Likes' ? 'likes your story' : notification?.notificationType === 'Follow' ? 'followed you. Tap to view profile' : notification?.notificationType === 'Subcribe' ? 'subscribed to your stories' : notification?.notificationType === 'CommentLikes' ? 'likes your comment' : notification?.notificationType === 'NewStory' ? 'posted a new story' : notification?.notificationType === 'SharedStory' ? 'shared your story' : notification?.notificationType === 'Tagged' ? 'tagged you' : notification?.notificationType === 'Message' ? 'sent you a message' : ''
              }&nbsp;
              <span 
              className={`font-bold ${notification?.notify?.title ? 'block' : 'hidden'}`}>
                {reduceLength(notification?.notify?.title as string, 30, 'letter')}
              </span>
            </Link>

            {/* <div className='text-xs'>
              {}
            </div> */}

          </div>

          <div className='flex flex-col justify-between items-end'>
            <button 
              onClick={() => deleteNotification(notification?._id)}
              className={`${notificationIds?.length ? 'hidden' : 'block'} rounded-sm hover:opacity-90 p-0.5 px-1 w-fit`}>
              <FaTrashRestore 
                title='remove'
                className={`${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
              />
            </button>
            <input 
              type='checkbox' title='mark' checked={isMarked}
              onChange={event => setIsMarked(event?.target.checked)}  className='mr-1 cursor-pointer rounded-full border-none focus:outline-none' 
            />
            <p 
              className={`text-[11px] ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} whitespace-nowrap`}
              >
              {format(notification?.createdAt as TDate)}
            </p>
          </div>

        </article>
      }
    </>
  )
}
