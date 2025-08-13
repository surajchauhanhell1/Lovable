import { NextRequest, NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogle } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { streamText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const google = createGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
});

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { missingImports, model } = await request.json();

    if (!missingImports || !Array.isArray(missingImports) || missingImports.length === 0) {
      return NextResponse.json({
        error: 'missingImports is required and must be a non-empty array'
      }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({
        error: 'model is required'
      }, { status: 400 });
    }

    console.log('[auto-complete-components] Request received');
    console.log('[auto-complete-components] Missing imports:', missingImports);
    console.log('[auto-complete-components] Model:', model);

    const createdComponents: string[] = [];

    // Select the appropriate AI model based on the request
    let aiModel;
    if (model.startsWith('anthropic/')) {
      aiModel = anthropic(model.replace('anthropic/', ''));
    } else if (model.startsWith('openai/')) {
      if (model.includes('gpt-oss')) {
        aiModel = groq(model);
      } else {
        aiModel = openai(model.replace('openai/', ''));
      }
    } else if (model.startsWith('google/')) {
      aiModel = google(model.replace('google/', ''));
    } else if (model.startsWith('local/')) {
      aiModel = ollama(model.replace('local/', ''));
    } else {
      // Default to groq if model format is unclear
      aiModel = groq(model);
    }

    for (const importPath of missingImports) {
      try {
        const componentName = importPath.split('/').pop();
        const filePath = `src/components/${componentName}.jsx`;

        console.log(`[auto-complete-components] Generating component for import: ${importPath}`);
        console.log(`[auto-complete-components] Component name: ${componentName}`);
        console.log(`[auto-complete-components] File path: ${filePath}`);

        const prompt = `Create a new React component named \`${componentName}\`.
The component should be a simple placeholder with a heading that says "Component: ${componentName}".
Use Tailwind CSS for styling.
The component should be a default export.
Do not include any other code or explanation.
Generate the full code for the file \`${filePath}\`.`;

        const result = await streamText({
          model: aiModel,
          prompt,
        });

        let fullResponse = '';
        for await (const delta of result.textStream) {
          fullResponse += delta;
        }

        // Extract the code from the response, assuming it's in a markdown block
        const codeMatch = fullResponse.match(/```(?:jsx|javascript)\n([\s\S]*?)```/);
        const componentCode = codeMatch ? codeMatch[1].trim() : fullResponse.trim();

        if (global.activeSandbox) {
          await global.activeSandbox.files.write(filePath, componentCode);
          createdComponents.push(componentName);
          console.log(`[auto-complete-components] Successfully created component: ${filePath}`);
        } else {
          console.warn('[auto-complete-components] No active sandbox. Cannot create component file.');
        }

      } catch (error) {
        console.error(`[auto-complete-components] Failed to generate component for import: ${importPath}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      components: createdComponents,
      files: createdComponents.length,
    });

  } catch (error) {
    console.error('[auto-complete-components] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
