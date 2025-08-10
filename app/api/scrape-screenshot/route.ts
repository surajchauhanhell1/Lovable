import { NextRequest, NextResponse } from 'next/server';
import { normalizeAndValidateHttpUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalizedUrl = normalizeAndValidateHttpUrl(url);
    if (!normalizedUrl) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    if (!FIRECRAWL_API_KEY) {
      return NextResponse.json({ error: 'FIRECRAWL_API_KEY is not set' }, { status: 500 });
    }

    // Use Firecrawl API to capture screenshot
    // Bust caches by appending timestamp param
    const bustedUrl = (() => {
      try {
        const u = new URL(normalizedUrl)
        u.searchParams.set('t', Date.now().toString())
        return u.toString()
      } catch {
        return normalizedUrl
      }
    })()

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: bustedUrl,
        formats: ['screenshot'],
        waitFor: 6000,
        timeout: 30000,
        blockAds: true,
        actions: [
          {
            type: 'wait',
            milliseconds: 2000 // Additional wait for dynamic content
          }
        ]
      })
    });

    if (!firecrawlResponse.ok) {
      const error = await firecrawlResponse.text();
      throw new Error(`Firecrawl API error: ${error}`);
    }

    const data = await firecrawlResponse.json();
    
    if (!data.success || !data.data?.screenshot) {
      throw new Error('Failed to capture screenshot');
    }

    return NextResponse.json({
      success: true,
      screenshot: data.data.screenshot,
      metadata: data.data.metadata
    });

  } catch (error: any) {
    console.error('Screenshot capture error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to capture screenshot' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const rawUrl = req.nextUrl.searchParams.get('url') || ''
    if (!rawUrl) {
      return new NextResponse('URL is required', { status: 400 })
    }
    const normalizedUrl = normalizeAndValidateHttpUrl(rawUrl)
    if (!normalizedUrl) {
      return new NextResponse('Invalid URL', { status: 400 })
    }

    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
    if (!FIRECRAWL_API_KEY) {
      return new NextResponse('FIRECRAWL_API_KEY is not set', { status: 500 })
    }

    const bustedUrl = (() => {
      try {
        const u = new URL(normalizedUrl)
        u.searchParams.set('t', Date.now().toString())
        return u.toString()
      } catch {
        return normalizedUrl
      }
    })()

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: bustedUrl,
        formats: ['screenshot'],
        waitFor: 6000,
        timeout: 30000,
        blockAds: true,
        actions: [{ type: 'wait', milliseconds: 2000 }]
      })
    })

    if (!firecrawlResponse.ok) {
      const text = await firecrawlResponse.text()
      return new NextResponse(`Firecrawl API error: ${text}`, { status: 502 })
    }

    const data = await firecrawlResponse.json()
    const sc: string | undefined = data?.data?.screenshot
    if (!data.success || !sc) {
      return new NextResponse('Failed to capture screenshot', { status: 502 })
    }

    // If Firecrawl returns a data URL, convert to binary; if URL, proxy it
    if (sc.startsWith('data:image/')) {
      const base64 = sc.split(',')[1] || ''
      const buffer = Buffer.from(base64, 'base64')
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60'
        }
      })
    }

    if (sc.startsWith('http')) {
      const imgRes = await fetch(sc)
      const arr = new Uint8Array(await imgRes.arrayBuffer())
      const contentType = imgRes.headers.get('content-type') || 'image/png'
      return new NextResponse(arr, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=60'
        }
      })
    }

    return new NextResponse('Unsupported screenshot format', { status: 502 })
  } catch (error: any) {
    console.error('Screenshot GET error:', error)
    return new NextResponse('Failed to capture screenshot', { status: 500 })
  }
}