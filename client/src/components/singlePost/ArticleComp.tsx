import { BsFillHandThumbsUpFill, BsHandThumbsUp } from 'react-icons/bs';
import { PostType, ThemeContextType } from '../../posts'
import { useThemeContext } from '../../hooks/useThemeContext'
import { format } from 'timeago.js';
import { useState } from 'react';
import { SkeletonSinglePage } from '../skeletons/SkeletonSinglePage';
import { RiSignalWifiErrorLine } from 'react-icons/ri';
import { ErrorResponse, UserProps } from '../../data';
import { useLikeAndUnlikeStoryMutation } from '../../app/api/storyApiSlice';
import { toast } from 'react-hot-toast';

type ArticleProps = {
  story: PostType,
  sidebar: boolean,
  user: UserProps,
  bodyContent: JSX.Element[],
  averageReadingTime: string,
  isLoading: boolean,
  isError: boolean,
  isMutating: boolean
  error: {error: string},
  followOrUnfollow: () => Promise<void>,
  refetch: () => Promise<void>
}

type HoverType = 'unfollow' | 'following'

export default function ArticleComp({ isError, story, bodyContent, user, sidebar, averageReadingTime, isLoading, error, isMutating, followOrUnfollow, refetch }: ArticleProps) {
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [hoverThis, setHoverThis] = useState<HoverType>('following');
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [likeAndUnlikeStory, { isLoading: isLikeLoading, error: likeError, isError: isLikeError }] = useLikeAndUnlikeStoryMutation()

  const likeUnlikeStory = async() => {
    try{
      const { _id } = story
      await likeAndUnlikeStory({userId: currentUserId, storyId: _id}).unwrap()
      refetch()
    }
    catch(err: unknown){
      const errors = likeError as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isLikeError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  let content;

  isLoading ? 
      content = <SkeletonSinglePage  />
  : isError ? content = <p className='flex flex-col gap-5 items-center text-3xl text-center text-red-400'>
  {/* {error?.error as {message: string}} */}
  Failed to Load Post
  <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
  </p> 
  : content = (
    <>
      <div className='relative flex items-center gap-3'>
        <p className='capitalize'>{story?.author || 'anonymous'}</p>
        <span>.</span>
        <p>{format(story?.storyDate, 'en-US')}</p>
          {
            (currentUserId && currentUserId !== story?.userId) ? (
              !user?.followings?.includes(story?.userId) ? (
                <button 
                  onClick={followOrUnfollow}
                  className={`rounded-md p-1 pl-2 pr-2 shadow-lg bg-slate-500 capitalize hover:opacity-90 transition-shadow duration-150 active:opacity-100 ${isMutating && 'animate-pulse'}`}>
                  follow
                </button>
                ):(
                <button 
                  onClick={followOrUnfollow}
                  onMouseEnter={() => setHoverThis('unfollow')}
                  onMouseLeave={() => setHoverThis('following')}
                  className={`rounded-md p-1 pl-2 pr-2 shadow-lg bg-slate-500 capitalize hover:opacity-90 transition-shadow duration-150 font-sans active:opacity-100 font-medium ${isMutating && 'animate-pulse'}`}>{hoverThis == 'unfollow' ? 'unfollow' : 'following'}
                </button>
              )
            ) : null
          }
      </div>
        <p className='whitespace-pre-wrap font-bold text-3xl uppercase'>{story?.title}</p>
        <p 
          className={`mt-2 whitespace-pre-wrap tracking-wider text-justify`}>
            {bodyContent}
        </p>
      <div className={`sticky z-50 bottom-3 shadow-2xl shadow-gray-600 ${theme == 'light' ? 'bg-gray-800' : 'bg-slate-800'} m-auto rounded-md p-2 w-3/5 mt-2 opacity-95 flex items-center gap-4 text-green-600 text-sm font-sans`}>{
      story?.body ?
        <div className="flex items-center justify-between w-full text-gray-300">
            <p>{averageReadingTime} read</p>
            {
              (story?.sharedLikes ? story?.sharedLikes?.includes(currentUserId) : story?.likes?.includes(currentUserId)) 
                ?
                  <p 
                    onClick={likeUnlikeStory}
                    className={`flex items-center gap-1 ${isLikeLoading && 'animate-bounce'}`}>
                    <BsFillHandThumbsUpFill title='like' className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
                    <span className={`font-mono text-base ${theme == 'dark' && 'text-white'}`}>
                      {story?.likes?.length}
                    </span>
                  </p>
                :
                  <p 
                    onClick={likeUnlikeStory}
                    className={`flex items-center gap-1 ${theme == 'light' ? 'text-black' : 'text-white'} ${isLikeLoading && 'animate-bounce'} `}>
                      <BsHandThumbsUp title='like' className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${story?.likes.includes(currentUserId) && 'text-red-500'}`} />
                      <span className={``}>
                        {story?.likes?.length}
                      </span>
                  </p>
            }
            {story?.edited && <p>edited {format(story?.editDate)}</p>}
        </div>
          : ''
        }
      </div>
    </>
  )

  return (
    <article 
      className={`app mt-2 flex-grow flex flex-col gap-3 overflow-y-scroll ${story?.fontFamily} p-2 pl-3 text-sm sm:w-full ${sidebar ? 'min-w-[58%]' : 'w-full'}`}>
        {content}
      </article>
  )
}