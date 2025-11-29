'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { ProtectedRoute } from './protected-route'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex h-screen w-full relative overflow-hidden font-overpass">
        {/* Professional background - handled by body */}
        
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 relative z-10">
          <main className="py-6 lg:py-8 w-full pb-12 min-h-full">
            <div className="px-4 sm:px-6 lg:px-8 2xl:px-12 w-full">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
