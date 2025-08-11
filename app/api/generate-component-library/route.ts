import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app.config';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

interface ComponentLibraryRequest {
  sandboxId: string;
  designStyle?: string;
  projectContext?: string;
}

const COMPONENT_LIBRARY_PROMPT = `You are a React component library generator. Generate a comprehensive set of reusable UI components that match the project's design system.

Generate 15 essential React components with TypeScript and Tailwind CSS:

1. Button (primary, secondary, outline variants)
2. Input (with label, error states)
3. Card (with header, body, footer)
4. Modal (with backdrop, close button)
5. Badge (success, warning, error, info)
6. Alert (success, warning, error, info)
7. Avatar (with fallback initials)
8. Dropdown Menu (with items, separators)
9. Tabs (horizontal navigation)
10. Progress Bar (with percentage)
11. Loading Spinner
12. Tooltip (hover state)
13. Checkbox (with label)
14. Radio Button (with label)
15. Toggle Switch

Requirements:
- Use TypeScript with proper interfaces
- Use Tailwind CSS for styling
- Include proper accessibility attributes
- Use React.forwardRef where appropriate
- Include JSDoc comments
- Make components composable and reusable
- Follow modern React patterns (hooks, functional components)
- Include proper prop validation

Design context: {{DESIGN_CONTEXT}}
Project context: {{PROJECT_CONTEXT}}

Format your response as XML with individual file tags:

<file path="components/ui/button.tsx">
// Button component code here
</file>

<file path="components/ui/input.tsx">
// Input component code here
</file>

Continue for all 15 components...

Make sure each component is production-ready and follows best practices.`;

export async function POST(req: NextRequest) {
  try {
    const body: ComponentLibraryRequest = await req.json();
    const { sandboxId, designStyle = 'modern', projectContext = 'general web application' } = body;

    if (!sandboxId) {
      return NextResponse.json({ error: 'Sandbox ID is required' }, { status: 400 });
    }

    // Get current sandbox files for context
    let currentProjectContext = projectContext;
    try {
      if (global.activeSandbox) {
        // Try to get some context from existing files
        const files = await global.activeSandbox.filesystem.list('/home/user/app');
        const hasReact = files.some((f: any) => f.name === 'package.json' || f.name.includes('react'));
        const hasTailwind = files.some((f: any) => f.name.includes('tailwind'));
        
        currentProjectContext += hasReact ? ' (React project)' : '';
        currentProjectContext += hasTailwind ? ' (with Tailwind CSS)' : '';
      }
    } catch (e) {
      // Ignore context gathering errors
    }

    // Generate component library using AI
    const prompt = COMPONENT_LIBRARY_PROMPT
      .replace('{{DESIGN_CONTEXT}}', designStyle)
      .replace('{{PROJECT_CONTEXT}}', currentProjectContext);

    const result = await generateText({
      model: groq(appConfig.ai.defaultModel),
      prompt,
      temperature: 0.3,
    });

    // Parse the AI response to extract files
    const filePattern = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
    const generatedFiles: Array<{ path: string; content: string }> = [];
    
    let match;
    while ((match = filePattern.exec(result.text)) !== null) {
      const [, path, content] = match;
      generatedFiles.push({
        path: path.trim(),
        content: content.trim()
      });
    }

    if (generatedFiles.length === 0) {
      return NextResponse.json({ 
        error: 'No components were generated. Please try again.',
        rawResponse: result.text 
      }, { status: 500 });
    }

    // Apply files to sandbox
    const results = {
      filesCreated: [] as string[],
      errors: [] as string[]
    };

    for (const file of generatedFiles) {
      try {
        if (!global.activeSandbox) {
          results.errors.push('No active sandbox available');
          continue;
        }

        // Ensure directory exists
        const dirPath = file.path.substring(0, file.path.lastIndexOf('/'));
        if (dirPath) {
          await global.activeSandbox.filesystem.makeDir(`/home/user/app/${dirPath}`, { recursive: true });
        }

        // Write the file
        await global.activeSandbox.filesystem.write(`/home/user/app/${file.path}`, file.content);
        results.filesCreated.push(file.path);
        
      } catch (error: any) {
        console.error(`Error creating file ${file.path}:`, error);
        results.errors.push(`Failed to create ${file.path}: ${error.message}`);
      }
    }

    // Also create an index file to export all components
    const indexContent = generatedFiles
      .map(f => {
        const componentName = f.path.split('/').pop()?.replace('.tsx', '');
        if (!componentName) return '';
        const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        return `export { default as ${capitalizedName} } from './${componentName}';`;
      })
      .filter(line => line !== '')
      .join('\n');

    try {
      await global.activeSandbox.filesystem.write('/home/user/app/components/ui/index.ts', indexContent);
      results.filesCreated.push('components/ui/index.ts');
    } catch (error: any) {
      results.errors.push(`Failed to create index file: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${results.filesCreated.length} components`,
      results,
      componentsGenerated: generatedFiles.length
    });

  } catch (error: any) {
    console.error('Component library generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate component library',
      details: error.message 
    }, { status: 500 });
  }
}