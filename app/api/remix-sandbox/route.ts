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

function extractSandboxIdFromUrl(url: string): string | null {
  try {
    const m = url.match(/https?:\/\/(?:\d+-)?([a-z0-9]+)\.e2b\.app/i)
    return m?.[1] ?? null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { sourceSandboxId?: string; sourceUrl?: string }
    let sourceSandboxId = body.sourceSandboxId

    if (!sourceSandboxId && body.sourceUrl) {
      sourceSandboxId = extractSandboxIdFromUrl(body.sourceUrl) ?? undefined
    }

    if (!sourceSandboxId) {
      return NextResponse.json({ success: false, error: 'sourceSandboxId or sourceUrl is required' }, { status: 400 })
    }

    if (!process.env.E2B_API_KEY) {
      return NextResponse.json({ success: false, error: 'E2B_API_KEY is not configured' }, { status: 500 })
    }

    // Connect to source sandbox
    const source = await Sandbox.connect(sourceSandboxId, { apiKey: process.env.E2B_API_KEY as string })

    // Read files from source sandbox (base64) excluding heavy folders
    const readResult = await source.runCode(`
import os, json, base64

def read_file_b64(path, max_size=200*1024):
    try:
        if os.path.getsize(path) > max_size:
            return None
        with open(path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')
    except:
        return None

base_dir = '/home/user/app'
files = {}
for root, dirs, names in os.walk(base_dir):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
    for name in names:
        full_path = os.path.join(root, name)
        rel_path = os.path.relpath(full_path, base_dir)
        content_b64 = read_file_b64(full_path)
        if content_b64 is not None:
            files[rel_path] = content_b64

print(json.dumps({ 'files': files }))
    `)

    const output = readResult.logs.stdout.join('')
    const parsed = JSON.parse(output) as { files: Record<string, string> }
    const fileEntries = Object.entries(parsed.files)

    // Create destination sandbox
    const dest = await Sandbox.create({ apiKey: process.env.E2B_API_KEY as string, timeoutMs: appConfig.e2b.timeoutMs })
    const destId = (dest as any).sandboxId
    const destHost = (dest as any).getHost(appConfig.e2b.vitePort)
    const destUrl = `https://${destHost}`

    // Write files into destination
    const writerScriptHeader = `
import os, base64
base_dir = '/home/user/app'
os.makedirs(base_dir, exist_ok=True)

def write_b64(rel_path, content_b64):
    path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(base64.b64decode(content_b64))
    `

    // Chunk writes to stay within payload sizes
    const chunkSize = 50
    for (let i = 0; i < fileEntries.length; i += chunkSize) {
      const chunk = fileEntries.slice(i, i + chunkSize)
      const python = [writerScriptHeader]
      for (const [rel, contentB64] of chunk) {
        // Escape rel for python string
        const safeRel = rel.replace(/\\/g, '/').replace(/'/g, "\\'")
        python.push(`write_b64('${safeRel}', '${contentB64}')`)
      }
      await dest.runCode(python.join('\n'))
    }

    // Install packages if package.json exists
    await dest.runCode(`
import os, subprocess
if os.path.exists('/home/user/app/package.json'):
    print('Installing npm packages...')
    subprocess.run(['npm', 'install'], cwd='/home/user/app', capture_output=True, text=True)
print('Packages install step finished')
    `)

    // Start Vite dev server
    await dest.runCode(`
import subprocess, os, time
os.chdir('/home/user/app')
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(1)
env = os.environ.copy()
env['FORCE_COLOR'] = '0'
process = subprocess.Popen(['npm', 'run', 'dev'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
print(f'Vite started PID: {process.pid}')
    `)

    // Wait for dev server
    await new Promise(resolve => setTimeout(resolve, appConfig.e2b.viteStartupDelay))

    // Store destination as the active sandbox for subsequent APIs
    global.activeSandbox = dest
    global.sandboxData = { sandboxId: destId, url: destUrl }
    if (!global.existingFiles) global.existingFiles = new Set<string>()
    global.sandboxState = {
      fileCache: { files: {}, lastSync: Date.now(), sandboxId: destId },
      sandbox: dest,
      sandboxData: { sandboxId: destId, url: destUrl },
    }

    return NextResponse.json({ success: true, sandboxId: destId, url: destUrl })
  } catch (error) {
    console.error('[remix-sandbox] Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}


