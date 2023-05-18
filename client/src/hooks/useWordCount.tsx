import { useMemo, useState } from 'react'

export const useWordCount = (post: string) => {
  const [wordsPerPost, setWordsPerPost] = useState<string>('');
  const AVERAGEREADINGTIME = 280;

  useMemo(() => {
    const totalWords = post?.split(' ').length
    
    setWordsPerPost(prev => {
      prev = (totalWords/AVERAGEREADINGTIME).toString()
      if (+prev < 1){
          prev = (+prev * 60).toString()
          return prev == '1' ? prev + ' second' : prev + ' seconds'
        }
      if (+prev > 1 && +prev < 60) {
        const hours = Math.floor(+prev);
        prev = ((+prev * 3600) - hours * 3600).toString();
        const minutes = Math .floor(+prev / 60).toString();
        prev = minutes.padStart(2, '0')
        return prev == '1' ? prev + ' minute' : prev + ' minutes'
      }
      else{
        prev = (+prev/60).toFixed(2);
        const hours = Math.floor(+prev);
        prev = ((+prev * 3600) - hours * 3600).toString();
        const minutes = Math.floor(+prev / 60).toString();
        // const seconds = Math.floor(+prev % 60);
        prev = hours.toString().padStart(2, '0')+':'+minutes.padStart(2, '0')
        return (+prev) < 2 ? prev + ' hour' : prev + ' hours'
      }
    })
  }, [post])

  return wordsPerPost
}