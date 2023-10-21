import { TypingEvent } from "../types/data";
import { useEffect, useState } from "react";

export type DelayedInputProps = { input: string, typing: TypingEvent }

export const useDelayedInput = (input: string, delay=250) => {
  const [delayedInputValue, setDelayedInputValue] = useState<DelayedInputProps>({input: '', typing: 'notTyping'})

  useEffect(() => {
    setDelayedInputValue(prev => ({...prev, typing: 'typing'}))
    const debounceDelay = setTimeout(() => {
                      setDelayedInputValue(prev => ({ ...prev, input: input as string, typing: 'notTyping' }))                 
                    }, delay);
    return () => {
      clearTimeout(debounceDelay)
    }
  }, [input, delay])

  return delayedInputValue
}
