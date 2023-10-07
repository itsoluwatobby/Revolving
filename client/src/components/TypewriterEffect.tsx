import { useState, useEffect } from 'react'

type TypewriterEffectProps = {
  text: string,
  delay?: number,
  start?: 'BEGIN' | 'END'
}

export default function TypewriterEffect({text, delay=0.5, start='END'}: TypewriterEffectProps) {
  const [typeWriterText, setTypewriterText] = useState<string>('')
  const [splitText, setSplitText] = useState<string>()
  const [typeWritingEvent, setTypeWritingEvent] = useState<'INPROGRESS' | 'ENDED'>('ENDED')

  useEffect(() => {
    let isMounted = true
    isMounted ? setSplitText(text) : null
    return () => {
      isMounted = false
    }
  }, [text])


  useEffect(() => {
    if(!splitText?.length) return
    const Timer_Delay = Math.floor(1000 * delay)
    let index = 0
    let timeoutId: NodeJS.Timeout = setInterval(() => {return})
    if(start === 'BEGIN'){
      setTypeWritingEvent('INPROGRESS')
      timeoutId = setInterval(() => {
        if(index <= splitText.length){
          setTypewriterText(splitText.substring(0, index))
          index++
        }
        else clearInterval(timeoutId)
      }, Timer_Delay)
    }
    // else if(index >= splitText.length){
    //   console.log(index)
    //   index = splitText.length - 1
    //   setTypeWritingEvent('INPROGRESS')
    //   timeoutId = setInterval(() => {
    //     if(index >= 0) {
    //       setTypewriterText(splitText?.substring(0, index))
    //       index--
    //     }
    //     else clearInterval(timeoutId)
    //   }, Timer_Delay)
    // }
    else {
      setTypeWritingEvent('ENDED')
      setSplitText('')
      index = 0
      clearInterval(timeoutId)
    }

    return () => clearInterval(timeoutId)
  }, [delay, start, splitText])

  return (
    <p className='text-white font-mono flex items-center duration-300 transition-all'>
      {typeWriterText}<span className='animate-pulse'>_</span>
    </p>
  )
}