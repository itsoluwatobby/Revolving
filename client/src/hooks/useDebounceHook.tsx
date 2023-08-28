import { useEffect, useState } from "react"
import { TypingEvent } from "../data"

export type DebounceProps = { savedTitle: string, savedBody: string, typing: TypingEvent, savedFontFamily: string }

export const useDebounceHook = ({ savedTitle, savedBody, savedFontFamily }: Partial<DebounceProps>, delay: number) => {
  const [debounceValue, setDebounceValue] = useState<DebounceProps | object>({})

  useEffect(() => {
    setDebounceValue(prev => ({...prev, typing: 'typing'}))
    const debounceDelay = setTimeout(() => {
                      setDebounceValue(prev => {
                        return {
                          ...prev, savedTitle, savedBody, savedFontFamily, typing: 'notTyping'
                        }
                      })
                    }, delay);
    return () => clearTimeout(debounceDelay)
  }, [savedTitle, savedBody, savedFontFamily, delay])

  return debounceValue
}

export const delayedPromise = (DELAY=1000) => {
  return () => new Promise(resolve => {
    return setTimeout(() => resolve, DELAY)
  })
}
