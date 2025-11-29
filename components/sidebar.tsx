'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  MdDashboard, 
  MdShowChart, 
  MdPieChart, 
  MdStar, 
  MdAccountBalanceWallet,
  MdPeople,
  MdPerson,
  MdEmail,
  MdLogout,
  MdCalendarToday,
  MdChat,
  MdSpeed,
  MdLightbulb,
  MdAdminPanelSettings,
  MdNotifications
} from 'react-icons/md'
import { RiStockLine, RiLineChartLine, RiRobot2Line } from 'react-icons/ri'
import { useSiteSettings } from '@/components/site-settings-context'
import Image from 'next/image'
import { PricingModal } from './pricing-modal'

const navigation = [
  { name: 'Dashboard', href: '/', icon: MdDashboard },
  { name: 'InvestSentry AI', href: '/ai-chat', icon: RiRobot2Line },
  { name: 'Stock', href: '/stocks', icon: RiStockLine },
  { name: 'Portfolio', href: '/portfolio', icon: MdPieChart },
  { name: 'Crypto', href: '/crypto', icon: MdAccountBalanceWallet },
  { name: 'Paper Trading', href: '/paper-trading', icon: RiLineChartLine },
  { name: 'Trade Ideas', href: '/trade-ideas', icon: MdLightbulb },
  { name: 'Fear & Greed', href: '/fear-greed', icon: MdSpeed },
  { name: 'News', href: '/news', icon: MdEmail },
  { name: 'Earnings', href: '/earnings', icon: MdCalendarToday },
  { name: 'Screener', href: '/screener', icon: MdShowChart },
  { name: 'Alerts', href: '/alerts', icon: MdNotifications },
  { name: 'Community', href: '/community', icon: MdPeople },
]

const accountNavigation = [
  { name: 'Contact Us', href: '/contact', icon: MdEmail },
]

export function Sidebar() {
  const settings = useSiteSettings()
  const siteName = settings?.siteName || 'InvestSentry'
  const siteLogo = settings?.siteLogo
  const primaryColor = settings?.primaryColor || '#ff4618'
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()

  // Get pathname safely after component mounts
  const pathnameHook = usePathname()
  const pathname = mounted ? pathnameHook : ''

  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for upgrade events from usage limit guards
  useEffect(() => {
    const handleOpenSubscriptionModal = () => {
      setShowPricingModal(true)
    }

    window.addEventListener('openSubscriptionModal', handleOpenSubscriptionModal)
    
    return () => {
      window.removeEventListener('openSubscriptionModal', handleOpenSubscriptionModal)
    }
  }, [])

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
              {siteLogo ? (
                <Image src={siteLogo} alt={siteName} width={40} height={40} className="rounded-xl shadow-lg" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`,
                    boxShadow: `0 4px 14px 0 ${primaryColor}63`
                  }}
                >
                  <RiLineChartLine className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="ml-3 text-xl font-bold text-foreground">{siteName}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
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

          {/* Account Section */}
          <div className="px-4 py-4 border-t border-border mt-auto">
            <div className="mb-3">
              <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Account
              </h3>
            </div>
            <nav className="space-y-1">
              {/* Profile Button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-accent hover:text-foreground transition-all group"
              >
                <MdPerson className="mr-3 w-4 h-4 text-muted-foreground transition-colors" 
                  style={{ '--hover-color': 'rgb(255, 70, 24)' } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(255, 70, 24)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                />
                <span className="truncate">Profile</span>
              </button>

              {/* Admin Panel Link - Only show if user is admin */}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-accent hover:text-foreground transition-all group"
                >
                  <MdAdminPanelSettings className="mr-3 w-4 h-4 text-muted-foreground transition-colors" 
                    style={{ '--hover-color': 'rgb(255, 70, 24)' } as React.CSSProperties}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(255, 70, 24)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                  />
                  <span className="truncate">Admin Panel</span>
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    Admin
                  </span>
                </Link>
              )}
              
              {accountNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-accent hover:text-foreground transition-all group"
                  >
                    <Icon className="mr-3 w-4 h-4 text-muted-foreground transition-colors" 
                      style={{ '--hover-color': 'rgb(255, 70, 24)' } as React.CSSProperties}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(255, 70, 24)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all group"
              >
                <MdLogout className="mr-3 w-4 h-4 text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                <span className="truncate">Logout</span>
              </button>
            </nav>
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
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
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
      
      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal 
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpgrade={() => {
            setShowProfileModal(false)
            setShowPricingModal(true)
          }}
        />
      )}
      
      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </>
  )
}

// Profile Modal Component
function ProfileModal({ user, onClose, onUpgrade }: { user: any, onClose: () => void, onUpgrade: () => void }) {
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleUpgrade = () => {
    onUpgrade()
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to change password')
        return
      }

      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordChange(false)
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('An error occurred while changing password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowPasswordChange(false)
  }

  // Safety check after hooks
  if (!user) {
    return null
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative p-6 pb-8"
          style={{
            background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white shadow-xl">
              <span className="text-4xl font-bold"
                style={{ color: 'rgb(255, 70, 24)' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {user?.name || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="text-sm font-semibold text-foreground capitalize">{user?.plan || 'Free'}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-semibold text-foreground">
                  {user?.joinDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Password</span>
              {!showPasswordChange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordChange(true)}
                  className="gap-2 h-8 text-xs"
                >
                  <Lock className="h-3 w-3" />
                  Change Password
                </Button>
              )}
            </div>

            {showPasswordChange && (
              <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="pl-9 pr-9 h-9 text-sm"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="pl-9 pr-9 h-9 text-sm"
                      placeholder="Enter new password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="pl-9 pr-9 h-9 text-sm"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={handleCancelPasswordChange} disabled={changingPassword} size="sm" className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    size="sm"
                    className="h-8 text-xs text-white"
                    style={{ backgroundColor: '#ff4618' }}
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
              style={{
                background: 'linear-gradient(135deg, rgb(255, 70, 24) 0%, rgb(255, 107, 53) 100%)'
              }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
