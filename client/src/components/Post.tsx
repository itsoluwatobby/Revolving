import { PostContextType, PostType } from '../posts'
import { useWordCount } from '../hooks/useWordCount'
import { FiMoreVertical } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { format } from 'timeago.js';
import { useState } from 'react';
import { usePostContext } from '../hooks/usePostContext';
import { Link, useNavigate } from 'react-router-dom';
import { TextRules } from '../fonts';

type Props = {
  post: PostType
}

export const Post = ({ post }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  const wordsPerPost = useWordCount(post?.body) as string;
  const { deletePosts } = usePostContext() as PostContextType
  const currentMode = localStorage.getItem('theme');
  // const {  } = usePostContext();

  const tooLong = (): string => {
    const wordLength = post?.body?.split(' ').length
    const words = wordLength >= 100 ? post?.body?.substring(0, 400)+'...' : post?.body
    return words
  }

  const watchWords = TextRules.keywords as string[]
  const bodyContent = post?.body ? tooLong().split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'text-red-600' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  const openText = () => {
    setOpen(false)
  }

  const deleted = (id: string | undefined) => {
    const postId = id as string
    deletePosts(postId)
  }
  
  return (
    <article 
      className={`${post?.fontFamily} p-2 pl-3 text-sm sm:w-full min-w-[58%]`}>
      <div className='relative flex items-center gap-3'>
        <p className='capitalize'>{post?.author}</p>
        <span>.</span>
        <p>{format(post?.date, 'en-US')}</p>
        <FiMoreVertical
          onClick={() => setOpen(prev => !prev)}
          title='Options'
          className={`absolute right-2 text-lg cursor-pointer hover:text-gray-600`}
        />
        {open &&
          <div className={`absolute top-4 right-4 flex flex-col gap-1.5 items-center text-2xl opacity-80 ${currentMode == 'light' ? 'bg-gray-300' : 'bg-gray-600'} p-1 rounded-md`}>
            <Link to={`/edit_story/${post?.postId}`} >  
              <CiEdit 
                title='Edit post'
                className={`cursor-pointer hover:opacity-70 shadow-lg transition-all ${currentMode == 'light' ? 'text-gray-600' : 'text-gray-200'}`}
              />
            </Link>
            <FaTrash
              onClick={() => deleted(post?.id)}
              title='Delete post'
              className={`cursor-pointer hover:opacity-70 text-xl shadow-lg transition-all ${currentMode == 'light' ? 'text-gray-600' : 'text-gray-200'}`}
            />
          </div>
        }
      </div>
        <p className='whitespace-pre-wrap font-bold capitalize text-xl'>{post?.title}</p>
      <Link to={`/story/${post?.postId}`} >
        <p 
          onClick={openText}
          className='whitespace-pre-wrap'>
            {bodyContent}
        </p>
      </Link>
      <div className='mt-2 opacity-90 flex items-center gap-4 text-green-600 text-sm font-sans'>
        <p>{post?.body ? wordsPerPost + ' read' : ''}</p>
        <p>{post?.likes}</p>
        {post?.body ? 
          post?.body.split(' ').length >= 100 &&
          <small className={`font-sans cursor-grab ${currentMode == 'light' ? 'text-gray-900' : 'text-gray-300'} hover:text-blue-800`}>Read more</small>
          : null
        }
      </div>
    </article>
  )
}