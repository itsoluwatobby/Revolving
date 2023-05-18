import { Link, useParams } from "react-router-dom"
import { usePostContext } from "../hooks/usePostContext"
import { PostContextType, PostType, ThemeContextType } from "../posts"
import { format } from 'timeago.js';
import { useWordCount } from "../hooks/useWordCount"
import { TextRules } from "../fonts";
import { BsArrowBarRight } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { useState } from "react";
import { useThemeContext } from "../hooks/useThemeContext";

export default function SingleStoryPage() {
  const { postId } = useParams()
  const [sidebar, setSidebar] = useState(false);
  const { posts } = usePostContext() as PostContextType
  const { theme } = useThemeContext() as ThemeContextType

  const post = posts?.find(pos => pos?._id == postId) as PostType;
  const wordsPerPost = useWordCount(post?.body)
  const watchWords = TextRules.keywords as string

  const sumarized = (length: number, sentence: string) => {
    const sum = sentence.length > length ? sentence.substring(0, length)+'...' : sentence;
    return sum
  }
  //FaFilePdf

  const bodyContent = post?.body ? post?.body.split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-600 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'text-red-600 bg-gray-600 rounded-sm' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'
//
  return (
    <main className='single_page box-border max-w-full flex-auto flex flex-col gap-4 drop-shadow-2xl'>
      <div className="flex h-full">
        <aside className={`sidebars md:block flex-none sm:w-1/4 w-4/12 transition-all overflow-y-scroll h-full ${sidebar ? 'maxscreen:translate-x-0' : 'maxscreen:-translate-x-96 maxscreen:w-0'} ${theme == 'light' ? 'bg-gray-50' : 'bg-slate-700'}  rounded-tr-lg z-50`}>
          <div className={`sticky top-0 w-full mb-1 z-50 opacity-80 ${theme == 'light' ? 'bg-gray-200 text-gray-600' : 'bg-slate-800'} flex justify-center items-center`}>
            <p className="font-bold p-0.5 drop-shadow-2xl font-serif uppercase shadow-lg">Recent Posts</p>
            <FaTimes 
              onClick={() => setSidebar(false)}
              className={`absolute sm:hidden block right-0 rounded-md text-xl cursor-pointer transition-all duration-300 hover:opacity-60 active:scale-[0.9] shadow-xl ${theme == 'light' ? 'bg-gray-200' : 'bg-slate-700 text-gray-400'}`} />
          </div>
          {
            posts?.length ? (
              <ul className="flex flex-col font-sans text-sm justify-center hover:pb-1 rounded-md transition-all duration-200 gap-2">
                  {
                    posts?.map(post => (
                      <li key={post?._id}
                        className={`shadow-sm ${theme == 'light' ? 'bg-gray-100' : ''} p-2`}
                      >
                          <Link to={`/story/${post?._id}`}>
                          <p className="text-center capitalize font-mono font-bold underline underline-offset-4">{sumarized(50, post?.title)}</p>
                          <p className="cursor-pointer">{sumarized(100, post?.body)}</p>
                          </Link>
                      </li>
                    ))
                  }
              </ul>
            ) : <p className="text-center">No posts</p>
          }
        </aside>
        <article 
          className={`flex-grow ${post?.fontFamily} p-2 pl-3 text-sm sm:w-full ${sidebar ? 'min-w-[58%]' : 'w-full'}`}>
          <div className='relative flex items-center gap-3'>
            <p className='capitalize'>{post?.author}</p>
            <span>.</span>
            <p>{format(post?.storyDate, 'en-US')}</p>
          </div>
            <p className='whitespace-pre-wrap font-bold capitalize text-xl'>{post?.title}</p>
            <p 
              className='whitespace-pre-wrap'>
                {bodyContent}
                {/* {post?.body} */}
            </p>
          <div className='mt-2 opacity-90 flex items-center gap-4 text-green-600 text-sm font-sans'>{
          post?.body ?
            <>
                <p>{wordsPerPost} read</p>
                <p>{post?.likes}</p>
            </>
              : ''
            }
          </div>
        </article>
          {post?.editDate ? <p>Edited {format(post?.editDate)}</p> : null}
      </div>
      <BsArrowBarRight 
        onClick={() => setSidebar(true)}
        className={`fixed md:hidden left-0 top-[40%] opacity-30 animate-bounce bg-slate-400 cursor-pointer rounded-tr-md rounded-br-md hover:opacity-80 p-1 text-[30px]`} />
    </main>
  )
}