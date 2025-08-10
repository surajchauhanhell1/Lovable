import { NextResponse } from 'next/server'
// Note: Public listing of all account sandboxes isn't exposed in code-interpreter SDK.
// For now, rely on configured env or current active sandbox.

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
    if (sandboxes.length === 0 && global.sandboxData?.url) {
      sandboxes.push({
        sandboxId: String(global.sandboxData.sandboxId),
        url: String(global.sandboxData.url)
      })
    }

    return NextResponse.json({ success: true, sandboxes })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}


