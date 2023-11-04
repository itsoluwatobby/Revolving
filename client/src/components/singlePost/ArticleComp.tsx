import LikeStory from './LikeStory';
import { format } from 'timeago.js';
import PostImage from '../PostImages';
import { Link } from 'react-router-dom';
import Comments from '../comments/Comments';
import { useState, useEffect } from 'react';
import FollowUnFollow from './FollowUnFollow';
import { RiSignalWifiErrorLine } from 'react-icons/ri';
import { MdOutlineInsertComment } from 'react-icons/md';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { BsFillFileEarmarkPdfFill } from 'react-icons/bs';
import { useThemeContext } from '../../hooks/useThemeContext';
import useRevolvingObserver from '../../hooks/useRevolvingObserver';
import { SkeletonSinglePage } from '../skeletons/SkeletonSinglePage';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CommentOptionProp, PostType, ThemeContextType } from '../../types/posts';

type ArticleProps = {
  story: PostType,
  sidebar: boolean,
  isError: boolean,
  isBarOpen: boolean,
  isLoading: boolean,
  triggerPrint: () => void,
  bodyContent: JSX.Element[],
  averageReadingTime: string,
  storyRef: React.RefObject<HTMLDivElement>,
}

export default function ArticleComp({ 
  isError, story, storyRef, isBarOpen, bodyContent, sidebar, averageReadingTime, isLoading, triggerPrint 
}: ArticleProps) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [openComment, setOpenComment] = useState<CommentOptionProp>({ option: 'Hide', storyId: '' })
  const { isIntersecting, observerRef } = useRevolvingObserver({ screenPosition: '-180px' })
  const { theme, setNotIntersecting } = useThemeContext() as ThemeContextType
  const [reveal, setReveal] = useState<boolean>(false)
  
  useEffect(() => {
    let isMounted = true
    isMounted ? setNotIntersecting(isIntersecting) : null
    return () => {
      isMounted = false
    }
  }, [isIntersecting, setNotIntersecting])

  const customCodeStyle = { 
    'width': '100%',
    'minHeight': '5rem',
    'maxHeight': '15rem',
    'borderWidth': '3px',
    'borderRadius': '5px',
    'backgroundColor': 'black',
  } as {[index: string]: string}

  let content: JSX.Element;

  isLoading ? 
      content = <SkeletonSinglePage  />
  : isError ? content = <p className='flex flex-col gap-5 items-center text-3xl text-center text-red-400'>
  {/* {error?.error as {message: string}} */}
  Failed to Load Post
  <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
  </p> 
  : content = (
    <div>
      <div className='relative flex items-center justify-between pr-2 pb-1'>
        <div className='flex items-center gap-3'>
          <Link to={`/profile/${story?.userId}`}>
            <p className='capitalize hover:underline underline-offset-1'>{story?.author || 'anonymous'}</p>
          </Link>
          <span>.</span>
          <p>{format(story?.createdAt, 'en-US')}</p>

          <FollowUnFollow userId={story?.userId} position={['others']} currentUserId={currentUserId} />
        </div>

        <BsFillFileEarmarkPdfFill 
          title='print as PDF'
          onMouseEnter={() => setReveal(true)}
          onMouseLeave={() => setReveal(false)}
          onClick={triggerPrint}
          className={`text-3xl fixed right-4 opacity-50 hover:opacity-80 hover:scale-[1.01] active:opacity-100 active:scale-1 transition-all`} 
        />
      
      </div>

      <div 
        ref={storyRef}
      >

        <h1 
          ref={observerRef as React.LegacyRef<HTMLHeadingElement>}
          className='whitespace-pre-wrap font-bold text-3xl uppercase break-keep py-1'>{story?.title}
        </h1>
        <p 
          className={`whitespace-pre-wrap font-sans tracking-wider text-justify`}>
            {bodyContent}
        </p>

        <PostImage story={story} position='single' />

      </div>

      <div className={`flex items-center flex-row gap-x-2 gap-y-3 midscreen:flex-col w-full p-3 pb-1`}>
        {
          story?.code?.map(snippetString => (
            <SyntaxHighlighter key={snippetString?._id as string} 
              customStyle={customCodeStyle}
              language={snippetString?.language} style={theme === 'light' ? dark : docco}
            >
              {snippetString?.body}
            </SyntaxHighlighter>
          ))
        }
      </div>

      <div className={`sticky z-50 bottom-5 ${reveal ? 'hidden' : 'flex'} shadow-2xl shadow-gray-600 ${theme == 'light' ? 'bg-slate-600' : 'bg-slate-800'} m-auto rounded-md p-2 w-3/5 mt-2 opacity-95 items-center gap-4 text-green-600 text-sm font-sans transition-all ${(story?.body && isIntersecting === 'INTERSECTING') ? 'scale-100' : 'scale-0'}`}> 
        <div className={`flex flex-wrap items-center justify-between w-full text-gray-300 text-xs`}>
          <p>{averageReadingTime} read</p>

          <p className={`flex items-center gap-1.5 ${theme == 'light' ? '' : ''}`}>
            <MdOutlineInsertComment
              title='comments'
              onClick={() => setOpenComment({option: 'Open', storyId: story._id})}
              className={`font-sans text-lg cursor-pointer ${theme == 'light' ? '' : ''} hover:text-gray-400`}/>
            <span className="">
              {story?.commentIds?.length}
            </span>
          </p>

          <LikeStory 
            story={story}
            position={['others']} 
          />
          {story?.edited && <p className='text-center text-xs'>edited {format(story?.updatedAt)}</p>}
        </div>
        
      </div>

    </div>
  )

  return (
    <article 
      className={`app mt-2 flex-grow flex flex-col gap-3 ${isBarOpen ? '' : 'px-32 midscreen:px-6 mobile:px-4'} overflow-y-scroll ${story?.fontFamily} p-2 px-6 text-sm sm:w-full ${sidebar ? 'min-w-[58%]' : 'w-full'}`}>
        {content}
        <Comments openComment={openComment} setOpenComment={setOpenComment} authorId={story?.userId} />
      </article>
  )
}