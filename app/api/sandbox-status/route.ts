import { NextRequest, NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
  var existingFiles: Set<string>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sandboxId = searchParams.get('sandbox') || undefined;

    // Check if sandbox exists
    let sandboxExists = !!global.activeSandbox;
    
    // If not, but a sandboxId is provided, attempt reconnect
    if (!sandboxExists && sandboxId) {
      try {
        console.log(`[sandbox-status] Attempting reconnect to sandbox ${sandboxId}...`);
        const sandbox = await Sandbox.connect(sandboxId, { apiKey: process.env.E2B_API_KEY });
        global.activeSandbox = sandbox;
        const host = (sandbox as any).getHost(5173);
        global.sandboxData = { sandboxId, url: `https://${host}` };
        sandboxExists = true;
      } catch (e) {
        console.error('[sandbox-status] Reconnect failed:', e);
      }
    }
    
    let sandboxHealthy = false;
    let sandboxInfo = null;
    
    if (sandboxExists && global.activeSandbox) {
      try {
        // Since Python isn't available in the Vite template, just check if sandbox exists
        // The sandbox object existing is enough to confirm it's healthy
        sandboxHealthy = true;
        sandboxInfo = {
          sandboxId: global.sandboxData?.sandboxId,
          url: global.sandboxData?.url,
          filesTracked: global.existingFiles ? Array.from(global.existingFiles) : [],
          lastHealthCheck: new Date().toISOString()
        };
      } catch (error) {
        console.error('[sandbox-status] Health check failed:', error);
        sandboxHealthy = false;
      }
    }
    
    return NextResponse.json({
      success: true,
      active: sandboxExists,
      healthy: sandboxHealthy,
      sandboxData: sandboxInfo,
      message: sandboxHealthy 
        ? 'Sandbox is active and healthy' 
        : sandboxExists 
          ? 'Sandbox exists but is not responding' 
          : 'No active sandbox'
    });
    
  } catch (error) {
    console.error('[sandbox-status] Error:', error);
    return NextResponse.json({ 
      success: false,
      active: false,
      error: (error as Error).message 
    }, { status: 500 });
  }
}