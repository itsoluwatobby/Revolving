import { PostType, ThemeContextType } from '../../posts'
import { useThemeContext } from '../../hooks/useThemeContext'
import { format } from 'timeago.js';
import { useRef, useCallback } from 'react';
import { SkeletonSinglePage } from '../skeletons/SkeletonSinglePage';
import { RiSignalWifiErrorLine } from 'react-icons/ri';
import LikeStory from './LikeStory';
import FollowUnFollow from './FollowUnFollow';

type ArticleProps = {
  story: PostType,
  sidebar: boolean,
  bodyContent: JSX.Element[],
  averageReadingTime: string,
  isLoading: boolean,
  isError: boolean,
}

export default function ArticleComp({ isError, story, bodyContent, sidebar, averageReadingTime, isLoading }: ArticleProps) {
  const { theme, notintersecting, setNotIntersecting } = useThemeContext() as ThemeContextType
  const observerRef = useRef<IntersectionObserver>(null)
  const headingRef = useCallback((node: HTMLHeadingElement) => {
    if(observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting){
        setNotIntersecting('Hide')
      }
      else setNotIntersecting('Open')
    },
    { threshold: 0,
      rootMargin: '-180px'
    }
    )
    if(node) observerRef.current.observe(node as unknown as Element)
  }, [setNotIntersecting])

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
        <p>{format(story?.createdAt, 'en-US')}</p>

        <FollowUnFollow userId={story?.userId} position='others' />
      
      </div>
        <h1 
          ref={headingRef as React.LegacyRef<HTMLHeadingElement>}
          className='whitespace-pre-wrap font-bold text-3xl uppercase'>{story?.title}
        </h1>
        <p 
          className={`whitespace-pre-wrap font-sans tracking-wider text-justify`}>
            {bodyContent}
        </p>
      <div className={`sticky z-50 bottom-3 shadow-2xl shadow-gray-600 ${theme == 'light' ? 'bg-slate-600' : 'bg-slate-800'} m-auto rounded-md p-2 w-3/5 mt-2 opacity-95 flex items-center gap-4 text-green-600 text-sm font-sans transition-all ${(story?.body && notintersecting === 'Hide') ? 'scale-100' : 'scale-0'}`}> 
        <div className={`flex flex-wrap items-center justify-between w-full text-gray-300 text-xs`}>
          <p>{averageReadingTime} read</p>
              <LikeStory 
                story={story}
                position='others' 
              />
          {story?.edited && <p className='text-center text-xs'>edited {format(story?.updatedAt)}</p>}
        </div>
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