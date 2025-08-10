import { NextRequest, NextResponse } from 'next/server'
import { Sandbox } from '@e2b/code-interpreter'
import { appConfig } from '@/config/app.config'
import type { SandboxState } from '@/types/sandbox'

declare global {
  // eslint-disable-next-line no-var
  var activeSandbox: any
  // eslint-disable-next-line no-var
  var sandboxData: any
  // eslint-disable-next-line no-var
  var existingFiles: Set<string>
  // eslint-disable-next-line no-var
  var sandboxState: SandboxState
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { sandboxId?: string }
    const sandboxId = body?.sandboxId
    if (!sandboxId) {
      return NextResponse.json({ success: false, error: 'sandboxId is required' }, { status: 400 })
    }

    if (!process.env.E2B_API_KEY) {
      return NextResponse.json({ success: false, error: 'E2B_API_KEY is not configured' }, { status: 500 })
    }

    // If a sandbox is already active and matches, reuse it
    if (global.sandboxData?.sandboxId === sandboxId && global.activeSandbox) {
      return NextResponse.json({ success: true, sandboxId, url: global.sandboxData.url })
    }

    // Connect to existing E2B sandbox
    const sbx = await Sandbox.connect(sandboxId, { apiKey: process.env.E2B_API_KEY as string })

    // Determine host for Vite dev server port
    const host = sbx.getHost(appConfig.e2b.vitePort)
    const url = `https://${host}`

    // Store globally similar to create-ai-sandbox
    global.activeSandbox = sbx
    global.sandboxData = { sandboxId, url }

    // Initialize containers if missing
    if (!global.existingFiles) {
      global.existingFiles = new Set<string>()
    }

    global.sandboxState = {
      fileCache: {
        files: {},
        lastSync: Date.now(),
        sandboxId,
      },
      sandbox: sbx,
      sandboxData: { sandboxId, url },
    }

    return NextResponse.json({ success: true, sandboxId, url })
  } catch (error) {
    console.error('[restore-sandbox] Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}


