'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type SandboxInfo = {
  sandboxId?: string
  url?: string
  filesTracked?: string[]
  lastHealthCheck?: string
}

type SandboxStatusResponse = {
  success: boolean
  active: boolean
  healthy: boolean
  sandboxData?: SandboxInfo | null
  message?: string
}

// Community demo grid removed per request

export default function ExploreLibrary() {
  const [sandbox, setSandbox] = useState<SandboxInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/sandbox-status')
        const data: SandboxStatusResponse = await res.json()
        if (!mounted) return
        setSandbox(data.active && data.sandboxData ? data.sandboxData : null)
      } catch (e) {
        if (!mounted) return
        setError('Failed to load sandbox status')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStatus()
    return () => { mounted = false }
  }, [])

  return (
    <div className="w-full bg-card/70 backdrop-blur-sm border-b border-border">
      <div className="px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Community AI Apps</h3>
          <div className="text-xs text-muted-foreground">Discover and open sandboxed apps</div>
        </div>

        {/* Active Sandbox */}
        <div className="rounded-lg border border-border bg-white p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">Your Active E2B Sandbox</div>
              <div className="text-xs text-muted-foreground mt-1">
                {loading ? 'Checking status…' : sandbox?.url ? `ID: ${sandbox.sandboxId}` : error || 'No active sandbox'}
              </div>
            </div>
            <div className="flex gap-2">
              {sandbox?.url && (
                <Button asChild size="sm" className="h-8 px-3">
                  <a href={sandbox.url} target="_blank" rel="noopener noreferrer">Open</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Community apps list removed; only show active sandbox access */}
      </div>
    </div>
  )
}


