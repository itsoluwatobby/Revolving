import { format } from "timeago.js";
import { useCallback } from 'react';
import UserCard from "../../UserCard";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FiMoreVertical } from "react-icons/fi";
import { useEffect, useState, useRef } from 'react';
import { ErrorResponse, PageType } from "../../../data";
import { useThemeContext } from "../../../hooks/useThemeContext";
import { ChatOption, PostType, Theme, ThemeContextType } from "../../../posts";
import { useDeleteSharedStoryMutation } from "../../../app/api/sharedStorySlice";
import { ErrorStyle, SuccessStyle, reduceLength } from "../../../utils/navigator";
import { TimeoutId } from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import { storyApiSlice, useDeleteStoryMutation } from "../../../app/api/storyApiSlice";

type PostTopProps = {
  story: PostType,
  bodyContent: JSX.Element[] | "No content",
  open: boolean,
  page?: PageType,
  openText: () => void,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PostTop({ story, bodyContent, page, openText, open, setOpen }: PostTopProps) {
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const userId = localStorage.getItem('revolving_userId') as string
  const [revealCard, setRevealCard] = useState<ChatOption>('Hide')
  const [hovering, setHovering] = useState<boolean>(false)
  const [onCard, setOnCard] = useState<boolean>(false)
  const [intersect, setIntersect] = useState<boolean>(false)
  const dispatch = useDispatch()
  const cardRef = useRef<HTMLElement>(null)
  const [deleteStory, { isLoading: isDeleteLoading, isError: isDeleteError }] = useDeleteStoryMutation()
  const [deleteSharedStory, { isLoading: isSharedDeleteLoading, isError: isSharedDeleteError }] = useDeleteSharedStoryMutation()
  const buttonOptClass = useCallback((theme: Theme) => {
    return `shadow-4xl shadow-slate-900 hover:scale-[1.04] z-50 active:scale-[1] transition-all text-center cursor-pointer p-2.5 pt-1 pb-1 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-700 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
  }, [])
  const observerRef = useRef<HTMLDivElement>(null)

  // const headingRef = useCallback((node: HTMLDivElement) => {
  //   if(observerRef.current) observerRef.current.disconnect()
  //   observerRef.current = new IntersectionObserver(entries => {
  //     if(entries[0].isIntersecting){
  //       setIntersect(true)
  //     }
  //     else setIntersect(false)
  //   },
  //   { threshold: 0,
  //     //rootMargin: '-180px'
  //   }
  //   )
  //   if(node) observerRef.current.observe(node as unknown as Element)
  // }, [])

  const deleted = async(id: string) => {
    try{
      story?.sharedId 
          ? await deleteSharedStory({userId, sharedId: story?.sharedId}).unwrap() 
              : await deleteStory({userId, storyId: id}).unwrap()
      story?.sharedId && dispatch(storyApiSlice.util.invalidateTags(['STORY']))
      const promptMessage = story?.sharedId ? 'Success!! Story unshared' : 'Success!! Post deleted'
      toast.success(promptMessage, SuccessStyle)
    }
    catch(err: unknown){
      const errors = (err as ErrorResponse) ?? (err as ErrorResponse)
      errors?.originalStatus == 401 ? setLoginPrompt('Open') : null;
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
      className={`maxmobile:text-base ${(isDeleteLoading || isSharedDeleteLoading) ? 'animate-pulse' : ''}`}>
      <div 
        // onClick={() => setOpen(false)}
        className='relative flex items-center gap-3'>
        <p 
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className='capitalize font-sans maxmobile:text-base cursor-pointer hover:opacity-90 transition-all'>{
          reduceLength(story?.sharedId ? (story?.sharedAuthor as string) :  story?.author, 10, 'letter') || 'anonymous'
          }
         
        </p>
        <span>.</span>
        <p className="font-sans flex items-center gap-2 text-sm">
          {story?.sharedId ? format(story?.sharedDate as string) : format(story?.createdAt)}
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
              {story?.sharedId ? 'Unshare' : 'Delete'}
            </span>
          </p>
        }
       
        <UserCard 
          userId={story?.sharedId ? (story?.sharerId as string) : story.userId}
          revealCard={revealCard} closeUserCard={closeUserCard} setOnCard={setOnCard}
          cardRef={cardRef as React.LegacyRef<HTMLElement>} setRevealCard={setRevealCard}
        />
        
      </div>
      
      <div className={`flex flex-col w-full ${story?.sharedId ? 'shadow-inner shadow-slate-300 rounded-md p-1 pt-2' : ''} ${theme === 'light' ? 'shadow-slate-300' : 'dark:shadow-slate-700'}`}>

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

          <p className="font-sans flex items-center text-sm gap-2">{format(story?.createdAt)}</p>
        
          {!story?.sharedAuthor ?
            <UserCard 
              closeUserCard={closeUserCard}
              userId={story.userId} cardRef={cardRef as React.LegacyRef<HTMLElement>}
              setRevealCard={setRevealCard} revealCard={revealCard} setOnCard={setOnCard}
            />
            : null 
          } 
        </div>

        <p className='whitespace-pre-wrap font-bold capitalize text-lg'>{story?.title}</p>

        <Link to={`/story/${story?._id}`} >
          <p 
            onClick={openText}
            className={`whitespace-pre-wrap text-justify text-sm first-letter:ml-3 first-letter:text-lg ${theme == 'light' ? 'text-black' : 'text-white'} first-letter:capitalize ${open ? 'opacity-40' : ''}`}>
              {bodyContent}
          </p>
        </Link> 
        
      </div>

    </div>
  )
}

// function buttonOptClass(theme: Theme){
//   return `shadow-4xl shadow-slate-900 hover:scale-[1.04] z-50 active:scale-[1] transition-all text-center cursor-pointer p-2.5 pt-1 pb-1 rounded-sm font-mono w-full ${theme == 'light' ? 'bg-slate-700 hover:text-gray-500' : 'bg-slate-800 hover:text-gray-300'}`
// }


