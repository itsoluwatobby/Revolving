import PostTop from './post/PostTop';
import { PageType } from '../../data';
import PostImage from '../PostImages';
import PostBase from './post/PostBase';
import { TextRules } from '../../fonts';3
import { reduceLength } from '../../utils/navigator';
import { MakeToButtom, PostType } from '../../posts';
// import useRevolvingObserver from '../../hooks/useRevolvingObserver';
import { useAverageReadTimePerStory } from '../../hooks/useAverageReadTimePerStory';


type Props = {
  story: PostType,
  page?: PageType,
}

export const Post = ({ story, page }: Props) => {
  const averageReadingTime = useAverageReadTimePerStory(story?.body) as string;
  // const { observerRef, isIntersecting } = useRevolvingObserver({screenPosition: '0px', threshold: 0})
  const adjustedStory = page === 'OTHERS' ? reduceLength(story?.body, 120, 'word') : reduceLength(story?.body, 150, 'word')

  const watchWords = TextRules.keywords as string[]
  const bodyContent = story && story?.body ? adjustedStory.split(' ').map((word, index) => {
    return (
      <span key={index} className={`${watchWords.includes(word) ? 'bg-gray-500 rounded-sm text-yellow-500' : (word.startsWith('(') || word.endsWith(').')) || word.slice(-1) == ')' ? 'bg-gray-400 rounded-sm text-red-500' : ''}`}>{word}{' '}</span>
    )
  }) : 'No content'
  
  return (
    <article 
      // ref={observerRef}
      className={`${story?.fontFamily} ${page === 'PROFILE' ? '' : ''} flex flex-col gap-1 text-xs sm:w-full min-w-[58%] transition-all`}>
      <PostTop bodyContent={bodyContent} story={story} />

      <PostImage story={story} position='main' page={page} />
      
      <PostBase 
        story={story as MakeToButtom} averageReadingTime={averageReadingTime}
      />
      {/* <Comments /> */}
    </article>
  )
}