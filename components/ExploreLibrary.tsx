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

type CommunityApp = {
  id: string
  name: string
  tagline: string
  category: string
  href?: string
}

const demoApps: CommunityApp[] = [
  { id: '1', name: 'Stable Diffusion XL', tagline: 'Generate high‑quality images from text', category: 'Image & Video', href: 'https://replicate.com/stability-ai/sdxl' },
  { id: '2', name: 'GPT‑4 Turbo Assistant', tagline: 'Advanced conversational AI for complex tasks', category: 'Chat & Agents' },
  { id: '3', name: 'Whisper Pro', tagline: 'Accurate speech‑to‑text transcription', category: 'Audio & Music' },
  { id: '4', name: 'Code Llama Pro', tagline: 'AI coding companion and refactoring aid', category: 'Developer Tools' },
  { id: '5', name: 'Smart Doc Parser', tagline: 'Extract structured data from documents', category: 'Text & Content' },
  { id: '6', name: 'AI Video Editor', tagline: 'Automated video editing workflows', category: 'Image & Video' }
]

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
          <h3 className="text-sm font-semibold tracking-tight">Explore AI App Library</h3>
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

        {/* Community Apps */}
        <div>
          <div className="text-sm font-medium mb-2">Community Apps (demo)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoApps.map((app) => (
              <div key={app.id} className="rounded-lg border border-border bg-white p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold line-clamp-1">{app.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{app.tagline}</div>
                    <div className="mt-2 inline-flex items-center text-[11px] text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                      {app.category}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {app.href ? (
                    <Button asChild size="sm" className="h-8 px-3">
                      <a href={app.href} target="_blank" rel="noopener noreferrer">Open</a>
                    </Button>
                  ) : (
                    <Button size="sm" className="h-8 px-3" disabled>
                      Open
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" className="h-8 px-3" disabled>
                    Remix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


