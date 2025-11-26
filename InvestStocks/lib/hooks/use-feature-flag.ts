import { useState, useEffect } from 'react'

/**
 * Hook to check if a feature is enabled (client-side)
 * @param key - Feature flag key
 * @param userPlan - User's plan (optional, for plan-specific checks)
 * @returns Object with enabled status and loading state
 */
export function useFeatureFlag(key: string, userPlan?: string) {
  const [enabled, setEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkFeature = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ key })
        if (userPlan) {
          params.append('plan', userPlan)
        }
        const response = await fetch(`/api/feature-flags/check?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to check feature flag')
        }
        const data = await response.json()
        setEnabled(data.enabled || false)
      } catch (error) {
        console.error(`Error checking feature flag ${key}:`, error)
        setEnabled(false)
      } finally {
        setLoading(false)
      }
    }

    checkFeature()
  }, [key, userPlan])

  return { enabled, loading }
}

/**
 * Hook to check multiple feature flags at once (client-side)
 * @param keys - Array of feature flag keys
 * @param userPlan - User's plan (optional)
 * @returns Object with enabled status for each key and loading state
 */
export function useFeatureFlags(keys: string[], userPlan?: string) {
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkFeatures = async () => {
      try {
        setLoading(true)
        const results: Record<string, boolean> = {}
        
        await Promise.all(
          keys.map(async (key) => {
            try {
              const params = new URLSearchParams({ key })
              if (userPlan) {
                params.append('plan', userPlan)
              }
              const response = await fetch(`/api/feature-flags/check?${params.toString()}`)
              if (response.ok) {
                const data = await response.json()
                results[key] = data.enabled || false
              } else {
                results[key] = false
              }
            } catch (error) {
              console.error(`Error checking feature flag ${key}:`, error)
              results[key] = false
            }
          })
        )
        
        setFlags(results)
      } catch (error) {
        console.error('Error checking feature flags:', error)
        const failedResults: Record<string, boolean> = {}
        keys.forEach(key => {
          failedResults[key] = false
        })
        setFlags(failedResults)
      } finally {
        setLoading(false)
      }
    }

    if (keys.length > 0) {
      checkFeatures()
    } else {
      setLoading(false)
    }
  }, [keys.join(','), userPlan])

  return { flags, loading }
}

