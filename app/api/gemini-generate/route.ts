import { NextRequest } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 60; // allow up to 60s streaming

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, messages } = body || {};

    const chatMessages = Array.isArray(messages) && messages.length > 0
      ? messages
      : prompt
        ? [{ role: 'user', content: String(prompt) }]
        : [];

    if (chatMessages.length === 0) {
      return Response.json({ error: 'Provide prompt or messages' }, { status: 400 });
    }

    const result = streamText({
      model: google('gemini-2.5-pro'),
      messages: chatMessages,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}


