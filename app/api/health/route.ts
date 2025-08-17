// app/api/health/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Check = { ok: boolean; message?: string };

async function checkOpenAI(): Promise<Check> {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return { ok: false, message: "Missing OPENAI_API_KEY" };

    // Lightweight "are you alive?" request
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });

    if (!r.ok) return { ok: false, message: `HTTP ${r.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err?.message || "OpenAI check failed" };
  }
}

async function checkSupabase(): Promise<Check> {
  try {
    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY;
    if (!url || !anon)
      return { ok: false, message: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" };

    // Minimal check: read one id from the apps table (200/206 means OK)
    const r = await fetch(`${url}/rest/v1/apps?select=id&limit=1`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      cache: "no-store",
    });

    if (r.status === 200 || r.status === 206) return { ok: true };
    return { ok: false, message: `HTTP ${r.status} (apps table or policy?)` };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Supabase check failed" };
  }
}

async function checkFirecrawl(): Promise<Check> {
  const key = process.env.FIRECRAWL_KEY;
  return key ? { ok: true } : { ok: false, message: "Missing FIRECRAWL_KEY" };
}

async function checkE2B(): Promise<Check> {
  const key = process.env.E2B_API_KEY;
  return key ? { ok: true } : { ok: false, message: "Missing E2B_API_KEY" };
}

export async function GET() {
  const [openai, supabase, firecrawl, e2b] = await Promise.all([
    checkOpenAI(),
    checkSupabase(),
    checkFirecrawl(),
    checkE2B(),
  ]);

  // Consider OpenAI + Supabase as must-pass
  const ok = openai.ok && supabase.ok;
  const status = ok ? 200 : 503;

  return NextResponse.json(
    { ok, openai, supabase, firecrawl, e2b },
    { status }
  );
}