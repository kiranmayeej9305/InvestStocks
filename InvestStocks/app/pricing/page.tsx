'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingModal } from '@/components/pricing-modal'
import { ProtectedRoute } from '@/components/protected-route'

export default function PricingPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setShowModal(true)
  }, [])

  const handleClose = () => {
    setShowModal(false)
    router.push('/dashboard')
  }

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <PricingModal isOpen={showModal} onClose={handleClose} />
      </div>
    </ProtectedRoute>
  )
}
