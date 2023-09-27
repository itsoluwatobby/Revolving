import { useCallback, useState } from "react"
import { IsIntersectingType } from "../posts"

type UseRevolvingObserverProps = {
  screenPosition: string,
  threshold?: number | number[] // not less than zero, not greater than 1
}

/**
 * @description
 * @param screenPosition
 * @param threshold (optional: defaulted to 0)
 */

export default function useRevolvingObserver({ screenPosition, threshold=0 }: UseRevolvingObserverProps) {
  const [isIntersecting, setIsIntersecting] = useState<IsIntersectingType>('NOT_INTERSECTING')

  const observerRef = useCallback((node: HTMLElement) => {
    const observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) setIsIntersecting('INTERSECTING')
      else setIsIntersecting('NOT_INTERSECTING')
    },{ rootMargin: screenPosition, threshold: threshold })
    if(node) observer.observe(node)
  }, [screenPosition, threshold])

  return { isIntersecting, observerRef }
}