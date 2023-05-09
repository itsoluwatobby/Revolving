import { useEffect, useState } from "react"

export type DebounceProps = { savedTitle: string, savedBody: string, typing: boolean, savedFontFamily: string }

export const useDebounceHook = ({ savedTitle, savedBody, savedFontFamily }: Partial<DebounceProps>, delay: number) => {
  const [debounceValue, setDebounceValue] = useState<DebounceProps | object>({})

  useEffect(() => {
    setDebounceValue(prev => ({...prev, typing: true}))
    const debounceDelay = setTimeout(() => {
                      setDebounceValue(prev => {
                        return {
                          ...prev, savedTitle, savedBody, savedFontFamily, typing: false
                        }
                      })
                    }, delay);
    return () => clearTimeout(debounceDelay)
  }, [savedTitle, savedBody, savedFontFamily, delay])

  return debounceValue
}

export const delayedPromise = () => {
  return () => new Promise(resolve => {
    return setTimeout(() => resolve, 1000)
  })
}
