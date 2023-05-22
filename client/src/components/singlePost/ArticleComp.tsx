import { BsHandThumbsUp } from 'react-icons/bs';
import { PostType, ThemeContextType } from '../../posts'
import { useThemeContext } from '../../hooks/useThemeContext'
import { format } from 'timeago.js';
import { useState } from 'react';

type ArticleProps = {
  post: PostType,
  sidebar: boolean,
  bodyContent: JSX.Element[],
  averageReadingTime: string
}

export default function ArticleComp({ post, bodyContent, sidebar, averageReadingTime }: ArticleProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const [hoverThis, setHoverThis] = useState<boolean>(false);

  return (
    <article 
      className={`app flex-grow overflow-y-scroll ${post?.fontFamily} p-2 pl-3 text-sm sm:w-full ${sidebar ? 'min-w-[58%]' : 'w-full'}`}>
      <div className='relative flex items-center gap-3'>
        <p className='capitalize'>{post?.author || 'anonymous'}</p>
        <span>.</span>
        <p>{format(post?.storyDate, 'en-US')}</p>
          {
            <button className="rounded-md p-1 pl-2 pr-2 shadow-lg bg-slate-500 capitalize hover:opacity-90 transition-shadow duration-150 active:opacity-100">
              follow
            </button>
            ||
            <button 
              onMouseEnter={() => setHoverThis(true)}
              onMouseLeave={() => setHoverThis(false)}
              className="rounded-md p-1 pl-2 pr-2 shadow-lg bg-slate-500 capitalize hover:opacity-90 transition-shadow duration-150 active:opacity-100">{hoverThis ? 'unfollow' : 'following'}
            </button>
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
    </article>
  )
}