'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { FeatureGuard } from '@/components/feature-guard'
import { Card } from '@/components/ui/card'
import { MdPeople, MdRocketLaunch } from 'react-icons/md'
import { useAuth } from '@/lib/contexts/auth-context'

export default function CommunityPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <FeatureGuard feature="community" userPlan={user?.plan}>
        <DashboardLayout>
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <Card className="max-w-2xl w-full">
              <div className="p-6 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 70, 24, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)'
                      }}
                    >
                      <MdPeople className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: 'rgb(255, 70, 24)' }} />
                    </div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <MdRocketLaunch className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                    Coming Soon
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    Community Feature
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed px-2">
                  We&apos;re building an amazing community platform where investors can connect, share ideas, and learn together. Stay tuned for exciting updates!
                </p>

                {/* Features Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">Forums</div>
                    <div className="text-xs text-muted-foreground">Discussion Boards</div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">Events</div>
                    <div className="text-xs text-muted-foreground">Live Webinars</div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">Learning</div>
                    <div className="text-xs text-muted-foreground">Educational Hub</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </DashboardLayout>
      </FeatureGuard>
    </ProtectedRoute>
  )
}

