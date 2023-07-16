import { format } from "timeago.js"
import { ErrorResponse, UserProps } from "../../../data"
import { reduceLength } from "../../../utils/navigator"
import { FiMoreVertical } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useThemeContext } from "../../../hooks/useThemeContext"
import { ChatOption, PostType, Theme, ThemeContextType } from "../../../posts"
import { useCallback } from 'react';
import { useGetUsersQuery } from "../../../app/api/usersApiSlice"
import { storyApiSlice, useDeleteStoryMutation } from "../../../app/api/storyApiSlice"
import { toast } from "react-hot-toast"
import { useEffect, useState, useRef } from 'react';
import { useDeleteSharedStoryMutation } from "../../../app/api/sharedStorySlice"
import { useDispatch } from "react-redux"
import UserCard from "../../UserCard"
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types"
import { current } from "@reduxjs/toolkit"

type PostTopProps = {
  story: PostType,
  bodyContent: JSX.Element[] | "No content",
  open: boolean,
  openText: () => void,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PostTop({ story, bodyContent, openText, open, setOpen }: PostTopProps) {
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const userId = localStorage.getItem('revolving_userId') as string
  const {data: users} = useGetUsersQuery()
  const [revealCard, setRevealCard] = useState<ChatOption>('Hide')
  const [hovering, setHovering] = useState<boolean>(false)
  const [onCard, setOnCard] = useState<boolean>(false)
  const dispatch = useDispatch()
  const cardRef = useRef<HTMLElement>(null)
  const [deleteStory, { isLoading: isDeleteLoading, isError: isDeleteError, error: deleteError }] = useDeleteStoryMutation()
  const [deleteSharedStory, { isLoading: isSharedDeleteLoading, isError: isSharedDeleteError, error: sharedDeleteError }] = useDeleteSharedStoryMutation()
  const buttonOptClass = useCallback((theme: Theme) => {
    return `shadow-4xl shadow-slate-900 hover:scale-[1.04] z-50 active:scale-[1] transition-all text-center cursor-pointer p-2.5 pt-1 pb-1 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-700 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
  }, [])

  const deleted = async(id: string) => {
    try{
      story?.sharedId 
          ? await deleteSharedStory({userId, sharedId: story?.sharedId}).unwrap() 
              : await deleteStory({userId, storyId: id}).unwrap()
      story?.sharedId && dispatch(storyApiSlice.util.invalidateTags(['STORY']))
      toast.success('Success!! Post deleted', {
        duration: 2000, icon: '💀', style: { background: '#FA2B50'}
      })
    }
    catch(err: unknown){
      const errors = isDeleteError ? deleteError as ErrorResponse : sharedDeleteError as ErrorResponse;
      errors?.originalStatus == 401 ? setLoginPrompt('Open') : null;
      (isDeleteError || isSharedDeleteError) && toast.error(`${errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  useEffect(() => {
    let timerId: TimeoutId;
    if(revealCard == 'Hide' && hovering){
      timerId = setTimeout(() => {
        setRevealCard('Open')
      }, 1000);
    }
    else if(!hovering && !onCard){
      timerId = setTimeout(() => {
        setRevealCard('Hide')
      }, 300);
    }
    return () => clearTimeout(timerId)
  }, [revealCard, hovering, onCard])

  const closeUserCard = () => {
    if(cardRef?.current){
      setRevealCard('Open')
      setOnCard(true)
    }
  }

  return (
    <div className={`${(isDeleteLoading || isSharedDeleteLoading) ? 'animate-pulse' : ''}`}>
      <div 
        // onClick={() => setOpen(false)}
        className='relative flex items-center gap-3'>
        <p 
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className='capitalize font-sans cursor-pointer hover:opacity-90 transition-all'>{
          reduceLength(story?.author, 10, 'letter') || 'anonymous'
          }
         
        </p>
        <span>.</span>
        <p className="font-sans flex items-center gap-2">
          {format(story?.createdAt)}
          {story?.sharedId ? <Link to={`/story/${story?._id}`} title="link to story" className="text-gray-400 cursor-pointer">shared</Link> : null}
        </p>
        {userId == story?.userId && (
          <FiMoreVertical
            onClick={() => setOpen(prev => !prev)}
            title='Options'
            className={`absolute right-2 text-lg cursor-pointer opacity-75 hov)er:text-gray-600`}
          />
          )
        }
        {/* MAKE THIS MORE ATTRACTIVE */}
        {(userId == story?.userId || userId == story?.sharedId) &&
          <p className={`absolute ${open ? 'block' : 'hidden'} p-0.5 gap-0.5 shadow-lg transition-all right-3 top-4 flex flex-col items-center border border-1 rounded-md text-xs ${theme == 'light' ? 'bg-slate-500 text-white' : 'border-gray-500 shadow-slate-800 bg-slate-900'}`}>
              {!story?.sharedId &&
                <span 
                title='Edit post'
                className={buttonOptClass(theme)}>
                  <Link to={`/edit_story/${story?._id}`} >  
                    Edit
                  </Link>
                </span>
              }
            <span 
              onClick={() => deleted(story?._id)}
              title='Delete post'
              className={buttonOptClass(theme)}>
              Delete
            </span>
          </p>
        }
       
        <UserCard 
          userId={story.userId}
          cardRef={cardRef as React.LegacyRef<HTMLElement>}
          setRevealCard={setRevealCard}
          revealCard={revealCard}    
          setHovering={setHovering}
          closeUserCard={closeUserCard}
          setOnCard={setOnCard}
        />  
      </div>
        <p 
          className='whitespace-pre-wrap font-bold capitalize text-lg'>{story?.title}</p>
      <Link to={`/story/${story?._id}`} >
        <p 
          onClick={openText}
          className={`whitespace-pre-wrap text-justify text-sm first-letter:ml-3 first-letter:text-lg ${theme == 'light' ? 'text-black' : 'text-white'} first-letter:capitalize ${open ? 'opacity-40' : ''}`}>
            {bodyContent}
        </p>
      </Link> 
    </div>
  )
}

// function buttonOptClass(theme: Theme){
//   return `shadow-4xl shadow-slate-900 hover:scale-[1.04] z-50 active:scale-[1] transition-all text-center cursor-pointer p-2.5 pt-1 pb-1 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-700 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
// }


