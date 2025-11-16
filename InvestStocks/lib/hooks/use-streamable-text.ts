import { StreamableValue, readStreamableValue } from 'ai/rsc'
import { useEffect, useState } from 'react'

export const useStreamableText = (
  content: string | StreamableValue<string>
) => {
  const [rawContent, setRawContent] = useState(
    typeof content === 'string' ? content : ''
  )

  useEffect(() => {
    let isMounted = true

    const processStream = async () => {
      if (typeof content === 'object') {
        let value = ''
        try {
          for await (const delta of readStreamableValue(content)) {
            if (!isMounted) break
            if (typeof delta === 'string') {
              setRawContent((value = value + delta))
            }
          }
        } catch (error) {
          console.error('Error processing streamable text:', error)
          if (isMounted) {
            setRawContent('Error: Unable to load response. Please try again.')
          }
        }
      } else {
        if (isMounted) {
          setRawContent(content)
        }
      }
    }

    // Use setTimeout to avoid immediate async operations
    const timeoutId = setTimeout(() => {
      processStream()
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [content])

  return rawContent
}
