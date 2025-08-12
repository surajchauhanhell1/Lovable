import { NextRequest, NextResponse } from 'next/server';
import SandboxManager from '@/lib/sandbox-manager';

export async function GET(request: NextRequest) {
  try {
    const manager = SandboxManager.getInstance();
    const status = await manager.getSandboxStatus();

    return NextResponse.json({
      success: true,
      active: status.active,
      healthy: status.healthy,
      sandboxData: status.sandboxInfo,
      message: status.healthy
        ? 'Sandbox is active and healthy'
        : status.active
          ? 'Sandbox exists but is not responding'
          : 'No active sandbox'
    });
  } catch (error: any) {
    console.error('[sandbox-status] Error:', error);
    return NextResponse.json({ 
      success: false,
      active: false,
      error: error?.message || 'Failed to get sandbox status'
    }, { status: 500 });
  }
}