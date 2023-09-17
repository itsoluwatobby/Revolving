import { useMemo, useState } from 'react'

/**
 * @description Gets the average read time of a story
 * @param story - story intended for reading
 * @returns average read time
 */
export const useAverageReadTimePerStory = (post: string) => {
  const [averageReadingTime, setAverageReadingTime] = useState<string>('');
  const AVERAGE_WORDS_PER_MINUTE = 250 as const;

  useMemo(() => {
    const totalWords = post?.split(' ').length
    
    setAverageReadingTime(prev => {
      // prev = sentence per minute
      prev = (totalWords/AVERAGE_WORDS_PER_MINUTE).toString()
      if(+prev < 1){
          prev = ((+prev * 60).toFixed(1)).toString()
          return +prev == 1 ? prev + ' second' : prev + ' seconds'
        }
      else if(+prev > 1 && +prev < 60) {
        prev = (+prev * 60).toString(); // average time in seconds
        const minutes = ((+prev / 60).toFixed(1)).toString(); // average time in minutes
        prev = minutes.padStart(2, '0')
        return +prev === 1 ? prev + ' minute' : prev + ' minutes'
      }
      else{
        prev = (+prev/60).toFixed(2);
        const hours = Math.floor(+prev);
        prev = ((+prev * 60) - hours * 3600).toString(); // average time in seconds
        const minutes = ((+prev / 60).toFixed(1)).toString(); // average time in minutes
        prev = hours.toString().padStart(2, '0')+':'+minutes.padStart(2, '0')
        return (+prev) < 2 ? prev + ' hour' : prev + ' hours'
      }
    })
  }, [post])

  return averageReadingTime
}