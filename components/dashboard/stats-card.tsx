'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { MdAttachMoney, MdShowChart, MdPeople, MdShoppingCart, MdTrendingUp } from 'react-icons/md'
import { RiLineChartLine } from 'react-icons/ri'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: 'dollar' | 'activity' | 'users' | 'cart' | 'trend'
  format?: 'currency' | 'number' | 'percentage'
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon = 'activity',
  format = 'number'
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(val))
    }
    if (format === 'percentage') {
      return `${val}%`
    }
    return val.toLocaleString()
  }

  const getIcon = () => {
    switch (icon) {
      case 'dollar':
        return <MdAttachMoney className="w-6 h-6" />
      case 'activity':
        return <RiLineChartLine className="w-6 h-6" />
      case 'users':
        return <MdPeople className="w-6 h-6" />
      case 'cart':
        return <MdShoppingCart className="w-6 h-6" />
      case 'trend':
        return <MdTrendingUp className="w-6 h-6" />
      default:
        return <MdShowChart className="w-6 h-6" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-success bg-success/10 border-success/20'
      case 'decrease':
        return 'text-destructive bg-destructive/10 border-destructive/20'
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-3 h-3" />
      case 'decrease':
        return <TrendingDown className="w-3 h-3" />
      default:
        return null
    }
  }

  const getIconColor = () => {
    switch (icon) {
      case 'dollar':
        return 'from-emerald-500 to-teal-500'
      case 'activity':
        return 'from-blue-500 to-cyan-500'
      case 'users':
        return 'from-purple-500 to-pink-500'
      case 'cart':
        return 'from-orange-500 to-red-500'
      case 'trend':
        return 'from-violet-500 to-purple-500'
      default:
        return 'from-blue-500 to-purple-500'
    }
  }

  return (
    <Card className="bg-card/50 dark:bg-slate-800/40 backdrop-blur-sm border-border hover:border-border/80 transition-all hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getIconColor()} flex items-center justify-center text-white shadow-lg`}>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold text-foreground">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center mt-2">
            <Badge className={`text-xs px-2 py-0.5 border ${getChangeColor()}`}>
              <div className="flex items-center space-x-1">
                {getChangeIcon()}
                <span>{Math.abs(change)}%</span>
              </div>
            </Badge>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
