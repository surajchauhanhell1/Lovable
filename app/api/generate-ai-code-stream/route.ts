import { NextRequest, NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Initialize AI providers with proper error handling
function initializeProviders() {
  const providers: any = {};
  
  if (process.env.GROQ_API_KEY) {
    providers.groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    providers.anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
    });
  }
  
  if (process.env.OPENAI_API_KEY) {
    providers.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }
  
  if (process.env.GEMINI_API_KEY) {
    providers.google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  
  return providers;
}

const providers = initializeProviders();

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'moonshotai/kimi-k2-instruct', sandboxId } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({
        error: 'Prompt is required'
      }, { status: 400 });
    }
    
    console.log('[generate-ai-code-stream] Request received');
    console.log('[generate-ai-code-stream] Model:', model);
    console.log('[generate-ai-code-stream] Prompt length:', prompt.length);
    console.log('[generate-ai-code-stream] Sandbox ID:', sandboxId);
    
    // Select the appropriate AI model
    let aiModel;
    let providerName = '';
    
    if (model.startsWith('anthropic/')) {
      if (!providers.anthropic) {
        return NextResponse.json({
          error: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your .env.local file.'
        }, { status: 400 });
      }
      aiModel = providers.anthropic(model.replace('anthropic/', ''));
      providerName = 'anthropic';
    } else if (model.startsWith('openai/')) {
      if (!providers.openai) {
        return NextResponse.json({
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file.'
        }, { status: 400 });
      }
      aiModel = providers.openai(model.replace('openai/', ''));
      providerName = 'openai';
    } else if (model.startsWith('google/')) {
      if (!providers.google) {
        return NextResponse.json({
          error: 'Google API key not configured. Please set GEMINI_API_KEY in your .env.local file.'
        }, { status: 400 });
      }
      aiModel = providers.google(model.replace('google/', ''));
      providerName = 'google';
    } else {
      // Default to Groq for models like 'moonshotai/kimi-k2-instruct'
      if (!providers.groq) {
        return NextResponse.json({
          error: 'Groq API key not configured. Please set GROQ_API_KEY in your .env.local file.'
        }, { status: 400 });
      }
      aiModel = providers.groq(model);
      providerName = 'groq';
    }
    
    console.log(`[generate-ai-code-stream] Using provider: ${providerName}`);
    
    // Enhanced system prompt for React development
    const systemPrompt = `You are an expert React developer and UI/UX designer. You create modern, responsive React applications using Vite, Tailwind CSS, and the latest React patterns.

CRITICAL INSTRUCTIONS:
1. You MUST specify packages using <package> tags BEFORE using them in your code
2. For example: <package>three</package> or <package>@heroicons/react</package>
3. Always use Tailwind CSS for styling - never create separate CSS files
4. Create complete, functional React components
5. Use modern React patterns (hooks, functional components)
6. Ensure responsive design with Tailwind breakpoints
7. Include proper TypeScript types when applicable

PACKAGE USAGE:
- For icons: <package>@heroicons/react</package> or <package>lucide-react</package>
- For animations: <package>framer-motion</package>
- For 3D graphics: <package>three</package> and <package>@react-three/fiber</package>
- For routing: <package>react-router-dom</package>
- For forms: <package>react-hook-form</package>
- For HTTP requests: <package>axios</package>

RESPONSE FORMAT:
Always structure your response with:
1. Brief explanation of what you're building
2. Package declarations using <package> tags
3. Complete file contents using <file path="..."> tags
4. Any additional setup instructions

Example response structure:
<explanation>
I'll create a modern landing page with hero section, features, and contact form.
</explanation>

<package>@heroicons/react</package>
<package>framer-motion</package>

<file path="src/App.jsx">
[Complete React component code here]
</file>

<file path="src/components/Hero.jsx">
[Complete component code here]
</file>

Remember: Always provide complete, working code that can be immediately used in a Vite React application.`;

    // Create the streaming response
    const result = await streamText({
      model: aiModel,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 8000,
    });
    
    // Track packages detected in real-time
    const packagesToInstall: string[] = [];
    let tagBuffer = '';
    
    // Create a transform stream to process the response
    const encoder = new TextEncoder();
    const stream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        
        // Buffer for incomplete tags
        const searchText = tagBuffer + text;
        
        // Look for package tags
        const packageRegex = /<package>([^<]+)<\/package>/g;
        let packageMatch;
        
        while ((packageMatch = packageRegex.exec(searchText)) !== null) {
          const packageName = packageMatch[1].trim();
          if (packageName && !packagesToInstall.includes(packageName)) {
            packagesToInstall.push(packageName);
            
            // Send package detection event
            const packageEvent = `data: ${JSON.stringify({
              type: 'package',
              name: packageName,
              message: `📦 Package detected: ${packageName}`
            })}\n\n`;
            
            controller.enqueue(encoder.encode(packageEvent));
          }
        }
        
        // Update buffer (keep last 100 chars to catch split tags)
        tagBuffer = searchText.slice(-100);
        
        // Send content chunk
        const contentEvent = `data: ${JSON.stringify({
          type: 'content',
          content: text
        })}\n\n`;
        
        controller.enqueue(encoder.encode(contentEvent));
      },
      
      flush(controller) {
        // Send completion event
        const completeEvent = `data: ${JSON.stringify({
          type: 'complete',
          packages: packagesToInstall
        })}\n\n`;
        
        controller.enqueue(encoder.encode(completeEvent));
      }
    });
    
    // Pipe the AI response through our transform stream
    const response = result.toAIStreamResponse();
    const transformedStream = response.body?.pipeThrough(stream);
    
    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('[generate-ai-code-stream] Error:', error);
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({
          error: 'API key configuration error. Please check your environment variables.',
          details: error.message
        }, { status: 401 });
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Please try again in a moment.',
          details: error.message
        }, { status: 429 });
      }
    }
    
    return NextResponse.json({
      error: 'Failed to generate AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}