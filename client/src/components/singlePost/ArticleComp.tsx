import { BsHandThumbsUp } from 'react-icons/bs';
import { PostType, ThemeContextType } from '../../posts'
import { useThemeContext } from '../../hooks/useThemeContext'
import { format } from 'timeago.js';
import { useState } from 'react';
import { SkeletonSinglePage } from '../skeletons/SkeletonSinglePage';
import { RiSignalWifiErrorLine } from 'react-icons/ri';
import { UserProps } from '../../data';

type ArticleProps = {
  post: PostType,
  sidebar: boolean,
  user: UserProps,
  bodyContent: JSX.Element[],
  averageReadingTime: string,
  isLoading: boolean,
  error: string,
  followOrUnfollow: () => Promise<void>
}

type HoverType = 'unfollow' | 'following'

export default function ArticleComp({ post, bodyContent, user, sidebar, averageReadingTime, isLoading, error, followOrUnfollow }: ArticleProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const [hoverThis, setHoverThis] = useState<HoverType>('following');

  let content;

  isLoading ? 
      content = <SkeletonSinglePage  />
  : error ? content = <p className='flex flex-col gap-5 items-center text-3xl text-center text-red-400'>
  {/* {error?.message as {message: string}} */}
  Failed to Load Post
  <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
  </p> 
  : content = (
    <>
      <div className='relative flex items-center gap-3'>
        <p className='capitalize'>{post?.author || 'anonymous'}</p>
        <span>.</span>
        <p>{format(post?.storyDate, 'en-US')}</p>
          {
            user?.followings?.includes(post?.userId) ? (
                <button 
                  onClick={followOrUnfollow}
                  className="rounded-md p-1 pl-2 pr-2 shadow-lg bg-slate-500 capitalize hover:opacity-90 transition-shadow duration-150 active:opacity-100">
                  follow
                </button>
              ):(
                <button 
                  onClick={followOrUnfollow}
                  onMouseEnter={() => setHoverThis('unfollow')}
                  onMouseLeave={() => setHoverThis('following')}
                  className="rounded-md p-1 pl-2 pr-2 shadow-lg bg-slate-500 capitalize hover:opacity-90 transition-shadow duration-150 active:opacity-100 font-sans font-medium">{hoverThis == 'unfollow' ? 'unfollow' : 'following'}
                </button>
              )
          }
      </div>
        <p className='whitespace-pre-wrap font-bold text-3xl uppercase'>{post?.title}</p>
        <p 
          className={`mt-2 whitespace-pre-wrap tracking-wider text-justify`}>
            {bodyContent}
        </p>
      <div className={`sticky z-50 bottom-3 shadow-2xl shadow-gray-600 ${theme == 'light' ? 'bg-gray-800' : 'bg-slate-800'} m-auto rounded-md p-2 w-3/5 mt-2 opacity-95 flex items-center gap-4 text-green-600 text-sm font-sans`}>{
      post?.body ?
        <div className="flex items-center justify-between w-full text-gray-300">
            <p>{averageReadingTime} read</p>
            <p className="flex items-center text-white gap-1">
              <BsHandThumbsUp title='like' className='text-lg cursor-pointer hover:scale-[1.1] active:scale-[1] transition-all' />
              <span className="">
                {post?.likes?.length}
              </span>
            </p>
            {post?.edited && <p>edited {format(post?.editDate)}</p>}
        </div>
          : ''
        }
      </div>
    </>
  )

  return (
    <article 
      className={`app mt-2 flex-grow flex flex-col gap-3 overflow-y-scroll ${post?.fontFamily} p-2 pl-3 text-sm sm:w-full ${sidebar ? 'min-w-[58%]' : 'w-full'}`}>
        {content}
      </article>
  )
}