import { MakeToButtom, PostType } from '../../posts'
import { useWordCount } from '../../hooks/useWordCount'
import { useState } from 'react';
import { TextRules } from '../../fonts';
import PostImage from '../PostImages';
import PostTop from './post/PostTop';
import PostBase from './post/PostBase';
import { reduceLength } from '../../utils/navigator';
import { PageType } from '../../data';
import Comments from '../comments/Comments';

type Props = {
  story: PostType
  page?: PageType
}

export const Post = ({ story, page }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  let averageReadingTime = useWordCount(story?.body) as string;
  const end = averageReadingTime.split(' ')[1]

  averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end
  const adjustedStory = page === 'OTHERS' ? reduceLength(story?.body, 120, 'word') : reduceLength(story?.body, 45, 'word')

  const watchWords = TextRules.keywords as string[]
  const bodyContent = story && story?.body ? adjustedStory.split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-600 rounded-sm text-yellow-500' : (word.includes('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'bg-gray-600 rounded-sm text-red-600' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  const openText = () => {
    setOpen(false)
  }
  
  return (
    <article 
      className={`${story?.fontFamily} ${page === 'PROFILE' ? '' : ''} flex flex-col gap-1 text-xs sm:w-full min-w-[58%]`}>
      <PostTop 
        open={open} setOpen={setOpen} openText={openText}
        bodyContent={bodyContent} story={story} page={page}
      />

      <PostImage story={story} position='main' page={page} />
      
      <PostBase 
        story={story as MakeToButtom} page={page}
        averageReadingTime={averageReadingTime}
      />
      <Comments />
    </article>
  )
}