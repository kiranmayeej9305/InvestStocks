'use client'

import { useState } from 'react'
import { Alert, ALERT_CONFIGURATIONS } from '@/lib/types/alerts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Icons } from '@/components/ui/icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AlertTableProps {
  alerts: Alert[]
  onToggle: (alertId: string, isActive: boolean) => Promise<void>
  onDelete: (alertId: string) => Promise<void>
}

export function AlertTable({ alerts, onToggle, onDelete }: AlertTableProps) {
  const [sortBy, setSortBy] = useState<'symbol' | 'created' | 'type' | 'status'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedAlerts = [...alerts].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol)
        break
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'type':
        comparison = a.alertType.localeCompare(b.alertType)
        break
      case 'status':
        comparison = Number(a.isActive) - Number(b.isActive)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (column: 'symbol' | 'created' | 'type' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const getAlertConfig = (alertType: string) => {
    return ALERT_CONFIGURATIONS[alertType] || {
      name: alertType.replace(/_/g, ' '),
      category: 'price',
      description: ''
    }
  }

  const formatTriggerCondition = (alert: Alert) => {
    const condition = alert.triggerCondition
    
    switch (condition.type) {
      case 'price_limit':
        return `${condition.operator === 'above' ? '>' : '<'} $${condition.value}`
      case 'percent_change':
        return `${condition.operator === 'increase' ? '+' : condition.operator === 'decrease' ? '-' : ''}${condition.value}%`
      case 'volume':
        return `Volume ${condition.operator} ${condition.value}`
      case 'technical':
        return `${condition.reference?.toUpperCase()} ${condition.operator} ${condition.value}`
      default:
        return 'Custom condition'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'price':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'volume':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'technical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'fundamental':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'earnings':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Icons.bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No alerts yet</h3>
        <p className="text-muted-foreground">Create your first alert to get started with notifications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('symbol')}
              >
                Symbol
                {sortBy === 'symbol' && (
                  <Icons.chevronDown className={`ml-1 h-4 w-4 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('type')}
              >
                Alert Type
                {sortBy === 'type' && (
                  <Icons.chevronDown className={`ml-1 h-4 w-4 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </TableHead>
              <TableHead>Condition</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                Status
                {sortBy === 'status' && (
                  <Icons.chevronDown className={`ml-1 h-4 w-4 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </TableHead>
              <TableHead>Notifications</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created')}
              >
                Created
                {sortBy === 'created' && (
                  <Icons.chevronDown className={`ml-1 h-4 w-4 inline ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAlerts.map((alert) => {
              const config = getAlertConfig(alert.alertType)
              
              return (
                <TableRow key={alert._id?.toString()}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{alert.symbol}</span>
                      {alert.triggered && (
                        <Badge variant="destructive" className="text-xs">
                          Triggered
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{config.name}</div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(config.category)}`}
                      >
                        {config.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {formatTriggerCondition(alert)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={(checked) => onToggle(alert._id!.toString(), checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {alert.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {alert.notificationMethods.map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method === 'email' && <Icons.mail className="h-3 w-3 mr-1" />}
                          {method === 'push' && <Icons.bell className="h-3 w-3 mr-1" />}
                          {method === 'sms' && <Icons.phone className="h-3 w-3 mr-1" />}
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <Icons.moreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onToggle(alert._id!.toString(), !alert.isActive)}
                        >
                          {alert.isActive ? 'Pause' : 'Activate'} Alert
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(alert._id!.toString())}
                          className="text-red-600"
                        >
                          <Icons.trash className="h-4 w-4 mr-2" />
                          Delete Alert
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}