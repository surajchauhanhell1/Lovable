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

function createComponentShowcasePage(generatedFiles: Array<{ path: string; content: string }>): string {
  const componentImports = generatedFiles
    .map(f => {
      const componentName = f.path.split('/').pop()?.replace('.tsx', '');
      if (!componentName) return '';
      const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
      return `import ${capitalizedName} from '../../components/ui/${componentName}';`;
    })
    .filter(line => line !== '')
    .join('\n');

  const componentSections = generatedFiles
    .map(f => {
      const componentName = f.path.split('/').pop()?.replace('.tsx', '');
      if (!componentName) return '';
      const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
      
      // Clean up the component code for display
      const cleanCode = f.content
        .replace(/^import.*$/gm, '') // Remove imports
        .replace(/^export default.*$/gm, '') // Remove export
        .replace(/^\s*$/gm, '') // Remove empty lines
        .trim();

      return `
  const ${componentName}Examples = {
    basic: \`<${capitalizedName}>Example</${capitalizedName}>\`,
    withProps: \`<${capitalizedName} variant="primary" size="lg">Example</${capitalizedName}>\`,
  };

  <ComponentSection
    title="${capitalizedName}"
    component={${capitalizedName}}
    examples={${componentName}Examples}
    code={\`${f.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}
  />`;
    })
    .filter(section => section !== '')
    .join('\n');

  return `import React, { useState } from 'react';
${componentImports}

// Copy to clipboard function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

// Component Section wrapper
const ComponentSection: React.FC<{
  title: string;
  component: React.ComponentType<any>;
  examples: { basic: string; withProps: string };
  code: string;
}> = ({ title, component: Component, examples, code }) => {
  const [showCode, setShowCode] = useState(false);
  const [activeExample, setActiveExample] = useState('basic');

  return (
    <div className="border border-gray-200 rounded-lg mb-8 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      
      <div className="p-6">
        {/* Live Preview */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Preview</h3>
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex flex-wrap gap-4">
              {activeExample === 'basic' && <Component>Example</Component>}
              {activeExample === 'withProps' && (
                <div className="space-y-2">
                  <Component variant="primary">Primary</Component>
                  <Component variant="secondary">Secondary</Component>
                  <Component size="sm">Small</Component>
                  <Component size="lg">Large</Component>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Example Tabs */}
        <div className="mb-4">
          <div className="flex space-x-2 mb-3">
            <button
              onClick={() => setActiveExample('basic')}
              className={\`px-3 py-1 rounded text-sm font-medium \${
                activeExample === 'basic'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }\`}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveExample('withProps')}
              className={\`px-3 py-1 rounded text-sm font-medium \${
                activeExample === 'withProps'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }\`}
            >
              With Props
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            {examples[activeExample as keyof typeof examples]}
          </div>
        </div>

        {/* Code Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showCode ? 'Hide Code' : 'Show Code'}
          </button>
          <button
            onClick={() => copyToClipboard(code)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            📋 Copy Component
          </button>
          <button
            onClick={() => copyToClipboard(examples[activeExample as keyof typeof examples])}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            📋 Copy Usage
          </button>
        </div>

        {/* Full Component Code */}
        {showCode && (
          <div className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ComponentLibraryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Component Library</h1>
          <p className="text-gray-600">
            Browse and copy components for your project. All components are built with TypeScript and Tailwind CSS.
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How to use these components:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click "Copy Component" to copy the full component code</li>
              <li>2. Create a new file in your components/ui/ folder</li>
              <li>3. Paste the code and save</li>
              <li>4. Import and use: \`import Button from './components/ui/button'\`</li>
            </ol>
          </div>
        </div>

        <div className="space-y-8">
          ${componentSections}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Need more components?</h3>
            <p className="mb-4">Generate additional components by chatting with the AI!</p>
            <button 
              onClick={() => window.parent?.postMessage({ type: 'focusChat' }, '*')}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Chat with AI →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

function createAppWithRouter(generatedFiles: Array<{ path: string; content: string }>): string {
  return `import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ComponentLibraryPage from './pages/components';
import './App.css';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">My App</h1>
            <div className="flex space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/components" className="text-blue-600 hover:text-blue-800 font-medium">
                🧩 Component Library
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Your App</h1>
          <p className="text-xl text-gray-600 mb-8">
            This is your main application. You now have ${generatedFiles.length} custom components ready to use!
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">🎉 Component Library Generated!</h2>
            <p className="text-gray-600 mb-6">
              We've created ${generatedFiles.length} professional components for your project. Each component includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              <li>TypeScript support with proper types</li>
              <li>Tailwind CSS styling</li>
              <li>Accessibility attributes</li>
              <li>Multiple variants and sizes</li>
              <li>Copy-paste ready code</li>
            </ul>
            
            <Link 
              to="/components" 
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              🧩 Browse Components →
            </Link>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">🚀 Quick Start</h3>
              <p className="text-gray-600 text-sm mb-4">Import and use components in your project:</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
                import Button from './components/ui/button';<br/>
                <br/>
                &lt;Button variant="primary"&gt;Click me&lt;/Button&gt;
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">📋 Copy & Paste</h3>
              <p className="text-gray-600 text-sm mb-4">Each component page includes:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live preview with examples</li>
                <li>• Full source code</li>
                <li>• Usage examples</li>
                <li>• One-click copy buttons</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/components" element={<ComponentLibraryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`;
}

function createNavigationComponent(): string {
  return `import React from 'react';

const ComponentLibraryNav: React.FC = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl">🧩</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            <strong>Component Library Generated!</strong> 
            <a 
              href="/components" 
              className="ml-2 font-medium underline hover:text-blue-800"
              target="_blank"
            >
              Browse Components →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentLibraryNav;`;
}

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

    // Install react-router-dom for navigation
    try {
      if (global.activeSandbox) {
        await global.activeSandbox.commands.run('npm install react-router-dom @types/react-router-dom', {
          cwd: '/home/user/app',
          timeout: 60
        });
      }
    } catch (e) {
      // Continue even if package installation fails
      console.log('Note: Could not install react-router-dom automatically');
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

    // Create component library showcase page
    const showcasePage = createComponentShowcasePage(generatedFiles);
    try {
      await global.activeSandbox.filesystem.makeDir('/home/user/app/src/pages', { recursive: true });
      await global.activeSandbox.filesystem.write('/home/user/app/src/pages/components.tsx', showcasePage);
      results.filesCreated.push('src/pages/components.tsx');
    } catch (error: any) {
      results.errors.push(`Failed to create showcase page: ${error.message}`);
    }

    // Create or update main App.tsx to include routing to components page
    const appContent = createAppWithRouter(generatedFiles);
    try {
      await global.activeSandbox.filesystem.write('/home/user/app/src/App.tsx', appContent);
      results.filesCreated.push('src/App.tsx');
    } catch (error: any) {
      // If App.tsx already exists, try to add navigation instead
      try {
        await global.activeSandbox.filesystem.write('/home/user/app/src/ComponentLibraryNav.tsx', createNavigationComponent());
        results.filesCreated.push('src/ComponentLibraryNav.tsx');
      } catch (navError: any) {
        results.errors.push(`Failed to create navigation: ${navError.message}`);
      }
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