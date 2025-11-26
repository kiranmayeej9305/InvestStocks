'use client'

import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ExportButtonProps {
  type: 'portfolio' | 'transactions' | 'watchlist'
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton({ 
  type, 
  label = `Export ${type}`,
  variant = 'outline',
  size = 'default'
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/export/${type}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `${type}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant={variant}
      size={size}
    >
      {loading ? (
        <>
          <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}

