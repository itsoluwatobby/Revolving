import { format } from "timeago.js";
import { useCallback } from 'react';
import UserCard from "../../UserCard";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FiMoreVertical } from "react-icons/fi";
import { ErrorResponse } from "../../../types/data";
import { useEffect, useState, useRef } from 'react';
import { useThemeContext } from "../../../hooks/useThemeContext";
import useRevolvingObserver from "../../../hooks/useRevolvingObserver";
import { useDeleteSharedStoryMutation } from "../../../app/api/sharedStorySlice";
import { ErrorStyle, SuccessStyle, reduceLength } from "../../../utils/navigator";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import { ChatOption, PostType, Theme, ThemeContextType } from "../../../types/posts";
import { storyApiSlice, useDeleteStoryMutation } from "../../../app/api/storyApiSlice";
import { deleteSingleImage } from "../../../utils/helperFunc";


type PostTopProps = {
  story: PostType,
  bodyContent: JSX.Element[] | "No content",
  setViewUsers: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export default function PostTop({ story, bodyContent, setViewUsers }: PostTopProps) {
  const [deleteSharedStory, { isLoading: isSharedDeleteLoading, isError: isSharedDeleteError }] = useDeleteSharedStoryMutation()
  const [deleteStory, { isLoading: isDeleteLoading, isError: isDeleteError }] = useDeleteStoryMutation()
  const { observerRef, isIntersecting } = useRevolvingObserver({screenPosition: '0px', threshold: 0.2})
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const userId = localStorage.getItem('revolving_userId') as string
  const [revealCard, setRevealCard] = useState<ChatOption>('Hide')
  const [hovering, setHovering] = useState<boolean>(false)
  const [onCard, setOnCard] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const cardRef = useRef<HTMLElement>(null)
  const dispatch = useDispatch()
  const buttonOptClass = useCallback((theme: Theme) => {
    return `shadow-4xl shadow-slate-900 hover:scale-[1.04] z-10 active:scale-[1] transition-all text-center cursor-pointer p-2.5 pt-1 pb-1 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-700 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
  }, [])

  const deleted = async(id: string) => {
    try{
      if(story?.sharedId) await deleteSharedStory({userId, sharedId: story?.sharedId}).unwrap() 
      else {
        if(story.picture?.length){
          await Promise.all(story.picture?.map(async(pic) => {
            await deleteSingleImage(pic, 'story')
          }))
        }
        await deleteStory({userId, storyId: id}).unwrap()
      } 
      story?.sharedId && dispatch(storyApiSlice.util.invalidateTags(['STORY']))
      const promptMessage = story?.sharedId ? 'Success!! Story unshared' : 'Success!! Post deleted'
      toast.success(promptMessage, SuccessStyle)
    }
    catch(err: unknown){
      const errors = (err as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 ? setLoginPrompt({opened: 'Open'}) : null;
      (isDeleteError || isSharedDeleteError) && toast.error(`${errors?.data?.meta?.message}`, ErrorStyle)
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
    <div 
      ref={observerRef as React.LegacyRef<HTMLDivElement>}
      onClick={() => setViewUsers('Hide')}
      className={`maxmobile:text-base ${(isDeleteLoading || isSharedDeleteLoading) ? 'animate-pulse' : ''} ${isIntersecting === 'NOT_INTERSECTING' ? 'scale-75' : 'scale-100'} duration-200 transition-all`}>
      <div 
        className='relative flex items-center gap-3'
      >

        <p 
          // ref={observerRef as React.LegacyRef<HTMLParagraphElement>}
          onClick={() => setHovering(prev => !prev)}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className={`capitalize font-sans text-sm maxmobile:text-base cursor-pointer hover:opacity-90 transition-all`}>{
          reduceLength(story?.sharedId ? (story?.sharedAuthor as string) :  story?.author, 10, 'letter') || 'anonymous'
          }
        </p>
        <span>.</span>
        <p className="font-sans flex items-center gap-2 text-xs opacity-80">
          {story?.sharedId ? format(story?.sharedDate as string) : format(story?.createdAt)}
          {story?.sharedId ? <Link to={`/story/${story?._id}`} title="link to story" className="text-gray-400 cursor-pointer">shared</Link> : null}
        </p>
        {(story?.sharedId ? userId === story?.sharerId : userId === story?.userId ) && (
          <FiMoreVertical
            onClick={() => setOpen(prev => !prev)}
            title='Options'
            className={`absolute right-2 text-lg cursor-pointer opacity-75 hov)er:text-gray-600`}
          />
          )
        }
      
        {(userId == story?.userId || userId == story?.sharerId) &&
          <ActionModal  
            theme={theme} story={story} open={open}
            buttonOptClass={buttonOptClass} deleted={deleted}
          />
        }
       
        <UserCard 
          currentUserId={userId}
          userId={story?.sharedId ? (story?.sharerId as string) : story.userId}
          revealCard={revealCard} closeUserCard={closeUserCard} setOnCard={setOnCard}
          cardRef={cardRef as React.LegacyRef<HTMLElement>} setRevealCard={setRevealCard}
        />
        
      </div>
      
      <div className={`flex flex-col w-full ${story?.sharedId ? 'shadow-inner shadow-slate-300 rounded-md p-1 pt-2' : ''} ${theme === 'light' ? (story?.sharedId ? 'shadow-slate-300 bg-slate-100' : '') : (story?.sharedId ? 'dark:shadow-slate-700 bg-slate-700' : '')}`}>

        <div 
          // onClick={() => setOpen(false)}
          className={`relative ${story?.sharedId ? 'flex' : 'hidden'} items-center gap-3`}>
          <p 
            onMouseEnter={() => !story?.sharedAuthor ? setHovering(true) : null}
            onMouseLeave={() => !story?.sharedAuthor ? setHovering(false) : null}
            className='capitalize font-sans cursor-pointer hover:opacity-90 transition-all'>{
            reduceLength(story?.author, 10, 'letter') || 'anonymous'
            }
          
          </p>

          <span>.</span>

          <p className="font-sans flex items-center text-xs opacity-80 gap-2">{format(story?.createdAt)}</p>
        
          {!story?.sharedAuthor ?
            <UserCard 
              closeUserCard={closeUserCard} currentUserId={userId}
              userId={story.userId} cardRef={cardRef as React.LegacyRef<HTMLElement>}
              setRevealCard={setRevealCard} revealCard={revealCard} setOnCard={setOnCard}
            /> 
            : null 
          } 
        </div>

        <p className='whitespace-pre-wrap font-bold capitalize text-lg'>{story?.title}</p>

        <Link to={`/story/${story?._id}`} >
          <p 
            onClick={() => setOpen(false)}
            className={`whitespace-pre-wrap text-justify text-sm first-letter:ml-3 px-1 first-letter:text-lg ${theme == 'light' ? 'text-black' : 'text-white'} first-letter:capitalize ${open ? 'opacity-40' : ''}`}>
              {bodyContent}
          </p>
        </Link> 
        
      </div>

    </div>
  )
}

type ActionModalProp = {
  story: PostType,
  open: boolean,
  theme: Theme,
  deleted: (id: string) => void
  buttonOptClass: (theme: Theme) => string
}

const ActionModal = ({ story, open, theme, buttonOptClass, deleted }: ActionModalProp) => {

  return (
    <p className={`absolute ${open ? 'block' : 'hidden'} p-0.5 gap-0.5 shadow-lg transition-all right-3 top-4 flex flex-col items-center border border-1 rounded-md text-xs ${theme == 'light' ? 'bg-slate-500 text-white' : 'border-gray-500 shadow-slate-800 bg-slate-900'}`}>
    {!story?.sharedId &&
      <span 
      title='Edit post'
      className={buttonOptClass(theme)}>
        <Link to={`/edit_story/${story?._id}/${story?.userId}`} >  
          Edit
        </Link>
      </span>
      }
    <span 
      onClick={() => deleted(story?._id)}
      title='Delete post'
      className={buttonOptClass(theme)}>
      {story?.sharedId ? 'Unshare' : 'Delete'}
    </span>
  </p>
  )
}
