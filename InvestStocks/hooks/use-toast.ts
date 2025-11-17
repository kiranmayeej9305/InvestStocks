'use client'

import { useState } from 'react'

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    // Simple toast implementation - in a real app you'd use a proper toast library
    console.log(`Toast (${variant}): ${title}`, description ? `- ${description}` : '')
    
    // You could integrate with a proper toast library here like:
    // - react-hot-toast
    // - sonner
    // - your own toast context
    
    const newToast = { title, description, variant }
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== newToast))
    }, 3000)
  }

  return { toast, toasts }
}