import { NextResponse } from 'next/server';
import SandboxManager from '@/lib/sandbox-manager';

export async function POST() {
  try {
    const manager = SandboxManager.getInstance();
    await manager.killSandbox();

    return NextResponse.json({
      success: true,
      sandboxKilled: true,
      message: 'Sandbox cleaned up successfully'
    });
  } catch (error: any) {
    console.error('[kill-sandbox] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to kill sandbox'
      }, 
      { status: 500 }
    );
  }
}