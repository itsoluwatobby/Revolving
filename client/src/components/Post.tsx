import { PostType } from '../posts'
import { useWordCount } from '../hooks/useWordCount'

type Props = {
  post: PostType
}

export const Post = ({ post }: Props) => {
  const wordsPerPost = useWordCount(post?.body) as string;
  const currentMode = localStorage.getItem('theme');

  const tooLong = (sentence: string): string => {
    const wordLength = sentence.split(' ').length
    const words = wordLength >= 100 ? sentence.substring(0, 400)+'...' : sentence
    return words
  }
  
  return (
    <article 
      className={`${post?.fontFamily} p-2 pl-3 text-sm sm:w-full min-w-[58%]`}>
      <div className='flex items-center gap-1'>
        <p className='capitalize'>{post?.author}</p>
        <span>.</span>
        <p>{post?.date}</p>
      </div>
        <p className='whitespace-pre-wrap font-extrabold capitalize text-xl'>{post?.title}</p>
      <p className='whitespace-pre-wrap'>{tooLong(post?.body)}</p>
      <div className='mt-2 opacity-90 flex items-center gap-4 text-green-600 text-sm font-sans'>
        <p>{wordsPerPost} read</p>
        <p>{post?.likes}</p>
        {
          post?.body.split(' ').length >= 100 &&
          <small className={`font-sans cursor-grab ${currentMode == 'light' ? 'text-gray-900' : 'text-gray-300'} hover:text-blue-800`}>Read more</small>
        }
      </div>
    </article>
  )
}