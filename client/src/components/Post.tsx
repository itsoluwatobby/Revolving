import { PostType, ThemeContextType } from '../posts'
import { useWordCount } from '../hooks/useWordCount'
import { FiMoreVertical } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { BsHandThumbsUp, BsFillHandThumbsUpFill } from 'react-icons/bs';
import { format } from 'timeago.js';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextRules } from '../fonts';
import { useSWRConfig } from 'swr';
import { axiosPrivate, posts_endPoint } from '../api/axiosPost';
import useAuthenticationContext from '../hooks/useAuthenticationContext';
import { deletePostOptions } from '../api/postApiOptions';
import { toast } from 'react-hot-toast';
import { useThemeContext } from '../hooks/useThemeContext';
import { AuthenticationContextType } from '../data';

type Props = {
  post: PostType
}

export const Post = ({ post }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  let averageReadingTime = useWordCount(post?.body) as string;
  const {mutate} = useSWRConfig()
  const { theme } = useThemeContext() as ThemeContextType
  const {auth} = useAuthenticationContext() as AuthenticationContextType
  const currentMode = localStorage.getItem('theme');
  const end = averageReadingTime.split(' ')[1]
  averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end
  const tooLong = (): string => {
    const wordLength = post?.body?.split(' ').length
    const words = wordLength >= 100 ? post?.body?.substring(0, 400)+'...' : post?.body
    return words
  }

  const watchWords = TextRules.keywords as string[]
  const bodyContent = post?.body ? tooLong().split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-600 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'bg-gray-600 rounded-sm text-red-600' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  const openText = () => {
    setOpen(false)
  }
  
  const deleted = (id: string) => {
    try{
      mutate(posts_endPoint, async () => await axiosPrivate.delete(`${posts_endPoint}/${auth?._id}/${id}`), deletePostOptions(id)) as unknown as PostType[];

      toast.success('Success!! Post deleted', {
        duration: 2000, icon: '💀', style: { background: '#FA2B50'}
      })
    }
    catch(error){
      toast.error('Failed!! Error deleting story', {
        duration: 2000, icon: '💀', style: { background: '#4BEB50'}
      })
    }
  }
 
  return (
    <article 
      className={`${post?.fontFamily} p-2 pl-3 text-sm sm:w-full min-w-[58%]`}>
      <div 
        // onClick={openText}
        className='relative flex items-center gap-3'>
        <p className='capitalize'>{post?.author || 'anonymous'}</p>
        <span>.</span>
        <p>{format(post?.storyDate, 'en-US')}</p>
        <FiMoreVertical
          onClick={() => setOpen(prev => !prev)}
          title='Options'
          className={`absolute right-2 text-lg cursor-pointer opacity-75 hover:text-gray-600`}
        />
        {/* MAKE THIS MORE ATTRACTIVE */}
        {open &&
          <div className={`absolute top-4 right-4 flex flex-col gap-1.5 items-center text-2xl opacity-80 ${currentMode == 'light' ? 'bg-gray-300' : 'bg-gray-600'} p-1 rounded-md`}>
            <Link to={`/edit_story/${post?._id}`} >  
              <CiEdit 
                title='Edit post'
                className={`cursor-pointer hover:opacity-70 shadow-lg transition-all ${currentMode == 'light' ? 'text-gray-600' : 'text-gray-200'}`}
              />
            </Link>
            <FaTrash
              onClick={() => deleted(post?._id)}
              title='Delete post'
              className={`cursor-pointer hover:opacity-70 text-xl shadow-lg transition-all ${currentMode == 'light' ? 'text-gray-600' : 'text-gray-200'}`}
            />
          </div>
        }
      </div>
        <p 
          className='whitespace-pre-wrap font-bold capitalize text-xl'>{post?.title}</p>
      <Link to={`/story/${post?._id}`} >
        <p 
          onClick={openText}
          className='whitespace-pre-wrap'>
            {bodyContent}
        </p>
      </Link>
      <div className='mt-2 opacity-90 flex items-center gap-4 text-green-600 text-sm font-sans'>
        <p>{post?.body ? averageReadingTime + ' read' : ''}</p>
        {
          (auth?._id && post?.likes?.includes(auth?._id)) 
            ?
              <p className="flex items-center gap-1">
                <BsFillHandThumbsUpFill title='like' className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
                <span className={`font-mono text-base ${theme == 'dark' && 'text-white'}`}>
                  {post?.likes?.length}
                </span>
              </p>
            :
              <p className={`flex items-center gap-1 ${theme == 'light' ? 'text-black' : 'text-white'}`}>
                  <BsHandThumbsUp title='like' className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer`} />
                  <span className="">
                    {post?.likes?.length}
                  </span>
              </p>
        }
        {post?.body && (
            post?.body.split(' ').length >= 100 &&
            <Link to={`/story/${post?._id}`}>
              <small className={`font-sans cursor-grab ${currentMode == 'light' ? 'text-gray-900' : 'text-gray-300'} hover:text-blue-800`}>Read more</small>
            </Link>
          )
        }
      </div>
    </article>
  )
}