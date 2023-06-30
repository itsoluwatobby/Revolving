import { MakeToButtom, PostType } from '../../posts'
import { useWordCount } from '../../hooks/useWordCount'
import { useState } from 'react';
import { TextRules } from '../../fonts';
import PostImage from './post/PostImages';
import PostTop from './post/PostTop';
import PostBase from './post/PostBase';
import { Categories } from '../../data';

type Props = {
  story: PostType
  // navigationTab: Categories
}

export const Post = ({ story }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  let averageReadingTime = useWordCount(story?.body) as string;

  const [imageLength, setImageLenth] = useState<boolean>(false)
  const end = averageReadingTime.split(' ')[1]

  const currentUserId = localStorage.getItem('revolving_userId') as string
  averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end
  const tooLong = (): string => {
    const wordLength = story?.body?.split(' ').length
    const words = wordLength >= 100 ? story?.body?.substring(0, 280)+'...' : story?.body
    return words
  }

  const watchWords = TextRules.keywords as string[]
  const bodyContent = story && story?.body ? tooLong().split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-600 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'bg-gray-600 rounded-sm text-red-600' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  const openText = () => {
    setOpen(false)
  }
 
  return (
    <article 
      className={`${story?.fontFamily} p-2 pl-3 text-xs sm:w-full min-w-[58%]`}>
      <PostTop 
        open={open} setOpen={setOpen} openText={openText}
        bodyContent={bodyContent} story={story}
      />

      <PostImage imageLength={imageLength} />
      
      <PostBase 
        story={story as MakeToButtom}
        averageReadingTime={averageReadingTime}
      />
    </article>
  )
}