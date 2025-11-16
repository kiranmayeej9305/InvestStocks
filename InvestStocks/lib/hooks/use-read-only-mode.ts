'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to check if admin panel is in read-only mode
 * Fetches the status from the API
 */
export function useReadOnlyMode(): boolean {
  const [readOnlyMode, setReadOnlyMode] = useState(false)

  useEffect(() => {
    fetch('/api/admin/read-only-mode')
      .then(res => res.json())
      .then(data => setReadOnlyMode(data.readOnlyMode || false))
      .catch(() => setReadOnlyMode(false))
  }, [])

  return readOnlyMode
}


