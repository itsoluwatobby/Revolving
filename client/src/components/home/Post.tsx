import { useState } from 'react';
import PostTop from './post/PostTop';
import { PageType } from '../../data';
import PostImage from '../PostImages';
import PostBase from './post/PostBase';
import { TextRules } from '../../fonts';
import Comments from '../comments/Comments';
import { reduceLength } from '../../utils/navigator';
import { MakeToButtom, PostType } from '../../posts';
import { useAverageReadTimePerStory } from '../../hooks/useAverageReadTimePerStory';

type Props = {
  story: PostType,
  page?: PageType,
  observerRef?: React.LegacyRef<HTMLElement>
}

export const Post = ({ story, page, observerRef }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  const averageReadingTime = useAverageReadTimePerStory(story?.body) as string;
  // const end = averageReadingTime.split(' ')[1]
  // averageReadingTime = Math.floor(+averageReadingTime.split(' ')[0]) + ' ' + end
  const adjustedStory = page === 'OTHERS' ? reduceLength(story?.body, 120, 'word') : reduceLength(story?.body, 150, 'word')

  const watchWords = TextRules.keywords as string[]
  const bodyContent = story && story?.body ? adjustedStory.split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-500 rounded-sm text-yellow-500' : (word.startsWith('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'bg-gray-400 rounded-sm text-red-500' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'

  const openText = () => {
    setOpen(false)
  }
  
  return (
    <article 
      ref={observerRef as React.LegacyRef<HTMLElement>}
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