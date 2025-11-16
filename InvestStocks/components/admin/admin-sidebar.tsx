'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
} from 'lucide-react'
import {
  MdDashboard,
  MdPeople,
  MdVpnKey,
  MdBarChart,
  MdSettings,
  MdLogout,
  MdAdminPanelSettings,
  MdDescription,
} from 'react-icons/md'
import { RiLineChartLine } from 'react-icons/ri'
import { Shield, CreditCard, Package } from 'lucide-react'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: MdDashboard },
  { name: 'Users', href: '/admin/users', icon: MdPeople },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Plans', href: '/admin/plans', icon: Package },
  { name: 'API Keys', href: '/admin/api-keys', icon: MdVpnKey },
  { name: 'Analytics', href: '/admin/analytics', icon: MdBarChart },
  { name: 'Settings', href: '/admin/settings', icon: MdSettings },
  { name: 'Logs', href: '/admin/logs', icon: MdDescription },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  // Get pathname safely after component mounts
  const pathnameHook = usePathname()
  const pathname = mounted ? pathnameHook : ''

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-xl border-2 shadow-xl transition-all touch-target"
        style={{
          background: isOpen ? 'rgba(255, 70, 24, 0.1)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: isOpen ? 'rgb(255, 70, 24)' : 'rgba(200, 200, 200, 0.3)'
        }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? (
          <X className="w-5 h-5" style={{ color: 'rgb(255, 70, 24)' }} />
        ) : (
          <Menu className="w-5 h-5" style={{ color: 'rgb(255, 70, 24)' }} />
        )}
      </button>

      {/* Sidebar - Fixed */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transform transition-transform duration-300 ease-in-out flex-shrink-0",
        "lg:translate-x-0 lg:static lg:h-screen border-r border-gray-200/50 dark:border-slate-700/50 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full min-h-screen">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 pt-20 lg:pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)',
                  boxShadow: '0 4px 14px 0 rgba(255, 70, 24, 0.39)'
                }}
              >
                <MdAdminPanelSettings className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-foreground block">Admin Panel</span>
                <span className="text-xs text-muted-foreground">StokAlert</span>
              </div>
            </div>
          </div>

          {/* Admin Badge */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Administrator</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group relative overflow-hidden",
                    isActive
                      ? "text-foreground border"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  style={isActive ? {
                    background: 'linear-gradient(to right, rgba(255, 70, 24, 0.1), rgba(255, 107, 53, 0.1))',
                    borderColor: 'rgba(255, 70, 24, 0.2)'
                  } : {}}
                >
                  {isActive && (
                    <div className="absolute inset-0 blur-xl" style={{ 
                      background: 'linear-gradient(to right, rgba(255, 70, 24, 0.05), rgba(255, 107, 53, 0.05))' 
                    }} />
                  )}
                  <Icon className={cn(
                    "mr-3 w-5 h-5 transition-all relative z-10",
                    isActive ? "" : "text-muted-foreground"
                  )} 
                  style={isActive ? { color: 'rgb(255, 70, 24)' } : {}}
                  />
                  <span className="truncate relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Back to Dashboard */}
          <div className="px-4 py-4 border-t border-border mt-auto">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-accent hover:text-foreground transition-all group"
            >
              <RiLineChartLine className="mr-3 w-4 h-4 text-muted-foreground transition-colors" 
                style={{ '--hover-color': 'rgb(255, 70, 24)' } as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(255, 70, 24)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              />
              <span className="truncate">Back to Dashboard</span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center px-2">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center ring-2"
                  style={{
                    background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)',
                    boxShadow: '0 0 0 2px rgba(255, 70, 24, 0.2)'
                  }}
                >
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all group"
            >
              <MdLogout className="mr-3 w-4 h-4 text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

