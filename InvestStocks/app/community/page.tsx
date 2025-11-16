'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { MdPeople, MdRocketLaunch } from 'react-icons/md'

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 ml-12 lg:ml-0">
        <Card className="max-w-2xl w-full">
          <div className="p-8 md:p-12 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 70, 24, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)'
                  }}
                >
                  <MdPeople className="w-12 h-12" style={{ color: '#FF9900' }} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <MdRocketLaunch className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Coming Soon
              </h1>
              <p className="text-xl text-muted-foreground">
                Community Feature
              </p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              We&apos;re building an amazing community platform where investors can connect, share ideas, and learn together. Stay tuned for exciting updates!
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-foreground mb-1">Forums</div>
                <div className="text-xs text-muted-foreground">Discussion Boards</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-foreground mb-1">Events</div>
                <div className="text-xs text-muted-foreground">Live Webinars</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-foreground mb-1">Learning</div>
                <div className="text-xs text-muted-foreground">Educational Hub</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

