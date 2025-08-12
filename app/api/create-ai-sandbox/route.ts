import { NextResponse } from 'next/server';
import SandboxManager from '@/lib/sandbox-manager';

export async function POST() {
  try {
    const manager = SandboxManager.getInstance();
    const info = await manager.createSandbox();

    return NextResponse.json({
      success: true,
      sandboxId: info.sandboxId,
      url: info.url,
      message: 'Sandbox created and Vite React app initialized'
    });
  } catch (error: any) {
    console.error('[create-ai-sandbox] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create sandbox' },
      { status: 500 }
    );
  }
}