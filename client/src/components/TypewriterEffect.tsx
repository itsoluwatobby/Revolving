import { useState, useEffect } from 'react'

type TypewriterEffectProps = {
  delay?: number,
  start?: 'BEGIN' | 'END'
}

export default function TypewriterEffect({delay=0.5, start='END'}: TypewriterEffectProps) {
  const [typeWriterText, setTypewriterText] = useState<string>('')
  const [typingPosition, setTypingPosition] = useState<'FORWARDS' | 'BACKWARDS'>('FORWARDS')
 
  useEffect(() => {
    const TEXT = 'Please login in' as const
    const Timer_Delay = Math.floor(1000 * delay)
    let index = 0
    let timeoutId: NodeJS.Timeout = setInterval(() => {return})
    if(start === 'END') return
    if(typingPosition === 'FORWARDS'){
      timeoutId = setInterval(() => {
        if(index <= TEXT.length){
          setTypewriterText(TEXT.substring(0, index))
          index++
        }
        else {
            setTypingPosition('BACKWARDS')
            clearInterval(timeoutId)
          }
        }, Timer_Delay)
      }
    else if(typingPosition === 'BACKWARDS'){
      index = TEXT.length - 1
      timeoutId = setInterval(() => {
        if(index >= 0) {
          setTypewriterText(TEXT?.substring(0, index))
          index--
        }
        else {
          setTypingPosition('FORWARDS')
          clearInterval(timeoutId)
        }
      }, Timer_Delay)
    }
    else {
      setTypewriterText('')
      index = 0
      clearInterval(timeoutId)
    }
    return () => clearInterval(timeoutId)
  }, [delay, start, typingPosition])

  return (
    <p className='text-white font-mono flex items-center duration-300 transition-all cursor-default'>
      {typeWriterText}<span className='animate-pulse'>_</span>
    </p>
  )
}