import { MakeToButtom, PostType } from '../posts'
import { useWordCount } from '../hooks/useWordCount'
import { useState } from 'react';
import { TextRules } from '../fonts';
import PostImage from './post/PostImages';
import PostTop from './post/PostTop';
import PostBase from './post/PostBase';

type Props = {
  post: PostType
  //navigationTab: Categories
}

export const Post = ({ post }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  let averageReadingTime = useWordCount(post?.body) as string;

  const [imageLength, setImageLenth] = useState<boolean>(false)
  const end = averageReadingTime.split(' ')[1]

  const userId = localStorage.getItem('revolving_userId') as string
  averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end
  const tooLong = (): string => {
    const wordLength = post?.body?.split(' ').length
    const words = wordLength >= 100 ? post?.body?.substring(0, 280)+'...' : post?.body
    return words
  }

  const watchWords = TextRules.keywords as string[]
  const bodyContent = post && post?.body ? tooLong().split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-600 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'bg-gray-600 rounded-sm text-red-600' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  const openText = () => {
    setOpen(false)
  }
 
  return (
    <article 
      className={`${post?.fontFamily} p-2 pl-3 text-xs sm:w-full min-w-[58%]`}>
      <PostTop 
        open={open} setOpen={setOpen} openText={openText}
        bodyContent={bodyContent} story={post}
      />

      <PostImage imageLength={imageLength} />
      
      <PostBase 
        story={post as MakeToButtom} 
        averageReadingTime={averageReadingTime}
      />
    </article>
  )
}