import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const services: Record<string, any> = {};
  const provider = process.env.AI_PROVIDER || 'openai';
  if (provider === 'openai') {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      services.openai = { ok: false, model, error: 'Missing OPENAI_API_KEY' };
    } else {
      try {
        const baseUrl = (process.env.OPENAI_BASE_URL?.replace(/\/+$/, '') || 'https://api.openai.com/v1');
        const res = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
        if (res.ok) {
          services.openai = { ok: true, model };
        } else {
          let errorMessage: string;
          try {
            const data = await res.json();
            errorMessage = data?.error?.message || res.statusText;
          } catch {
            errorMessage = res.statusText;
          }
          services.openai = { ok: false, model, error: errorMessage };
        }
      } catch (error) {
        services.openai = { ok: false, model, error: (error as Error).message };
      }
    }
  }
  const status = Object.values(services).every((svc: any) => svc?.ok) ? 'ok' : 'error';
  return NextResponse.json({ status, services });
}
