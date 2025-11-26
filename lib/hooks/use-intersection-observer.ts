import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  enabled?: boolean
}

/**
 * Custom hook for intersection observer (for infinite scroll)
 */
export function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  enabled = true,
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !targetRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        setIsIntersecting(isElementIntersecting)
        if (isElementIntersecting) {
          setHasIntersected(true)
        }
      },
      { threshold, root, rootMargin }
    )

    const currentTarget = targetRef.current
    observer.observe(currentTarget)

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [enabled, threshold, root, rootMargin])

  return { targetRef, isIntersecting, hasIntersected }
}

