import { NextResponse } from 'next/server'
import { Sandbox } from '@e2b/code-interpreter'
import { appConfig } from '@/config/app.config'

declare global {
  // From create-ai-sandbox route
  // eslint-disable-next-line no-var
  var sandboxData: any
}

type CommunitySandbox = {
  sandboxId: string
  url: string
}

export async function GET() {
  try {
    const env = process.env.E2B_COMMUNITY_SANDBOXES
    let sandboxes: CommunitySandbox[] = []

    if (env) {
      try {
        const parsed = JSON.parse(env) as Array<Partial<CommunitySandbox>>
        sandboxes = parsed
          .filter((s) => typeof s?.url === 'string')
          .map((s, idx) => ({
            sandboxId: String(s?.sandboxId ?? idx + 1),
            url: String(s?.url),
          }))
      } catch {
        // Fallback: comma-separated URLs
        sandboxes = env
          .split(',')
          .map((u) => u.trim())
          .filter((u) => u.length > 0)
          .map((u, idx) => ({ sandboxId: String(idx + 1), url: u }))
      }
    }

    // If none configured, try listing from E2B using the master key
    // If none configured, list from account using SDK (requires E2B_API_KEY)
    if (sandboxes.length === 0 && process.env.E2B_API_KEY) {
      try {
        const listed = await Sandbox.list({ apiKey: process.env.E2B_API_KEY as string })
        const results: CommunitySandbox[] = []
        for (const info of listed) {
          try {
            const sbx = await Sandbox.connect(info.sandboxId, { apiKey: process.env.E2B_API_KEY as string })
            const host = sbx.getHost(appConfig.e2b.vitePort)
            results.push({ sandboxId: info.sandboxId, url: `https://${host}` })
          } catch {
            results.push({ sandboxId: info.sandboxId, url: '' })
          }
        }
        sandboxes = results
      } catch {
        // Ignore and fall back to current sandbox if available
      }
    }

    if (sandboxes.length === 0 && global.sandboxData?.url) {
      sandboxes.push({ sandboxId: String(global.sandboxData.sandboxId), url: String(global.sandboxData.url) })
    }

    return NextResponse.json({ success: true, sandboxes })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}


