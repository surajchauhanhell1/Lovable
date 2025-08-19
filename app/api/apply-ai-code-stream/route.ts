import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Temporary stub to satisfy build; implement streaming logic as needed.
export async function POST(_: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'apply-ai-code-stream is temporarily disabled during build.' },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
