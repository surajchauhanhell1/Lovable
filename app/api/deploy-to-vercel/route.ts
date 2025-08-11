import { NextRequest, NextResponse } from 'next/server';
import type { SandboxState } from '@/types/sandbox';

interface DeploymentRequest {
  sandboxId?: string;
  projectName?: string;
}

interface VercelFile {
  file: string;
  data: string;
}

declare global {
  // Active E2B sandbox handle (may be undefined on serverless cold starts)
  // eslint-disable-next-line no-var
  var activeSandbox: any | undefined;
  // Server-side cache of files captured during generation
  // Must match existing global declaration exactly (no union)
  // eslint-disable-next-line no-var
  var sandboxState: SandboxState;
}

export async function POST(req: NextRequest) {
  try {
    const body: DeploymentRequest = await req.json();
    const { projectName = 'my-site', sandboxId } = body;

    console.log('[deploy-vercel] Starting deployment process...');

    // Get all files from the sandbox
    const files: VercelFile[] = [];
    
    try {
      // Prefer server-side cached files captured during generation
      const cachedFiles = global.sandboxState?.fileCache?.files;
      if (cachedFiles && Object.keys(cachedFiles).length > 0) {
        console.log('[deploy-vercel] Using cached files from sandboxState');
        for (const [path, fileData] of Object.entries(cachedFiles)) {
          if (!shouldSkipFile(path)) {
            const content = (fileData as any).content as string;
            files.push({ file: path, data: content });
          }
        }
      } else if (global.activeSandbox) {
        // Fallback to querying the live sandbox if available
        console.log('[deploy-vercel] Cached files not found. Listing files from active sandbox');
        const result = await global.activeSandbox.filesystem.list('/home/user/app', { recursive: true });
        for (const item of result) {
          if (item.type === 'file' && !shouldSkipFile(item.path)) {
            try {
              const content = await global.activeSandbox.filesystem.read(`/home/user/app/${item.path}`);
              files.push({ file: item.path, data: content });
            } catch (readError) {
              console.warn(`[deploy-vercel] Could not read file ${item.path}:`, readError);
            }
          }
        }
      } else {
        console.warn('[deploy-vercel] No cached files and no active sandbox handle available');
      }

      // Ensure we have essential files for a React/Vite project
      await ensureEssentialFiles(files);

      console.log(`[deploy-vercel] Collected ${files.length} files for deployment`);

    } catch (error) {
      console.error('[deploy-vercel] Error collecting files:', error);
      return NextResponse.json({ 
        error: 'Failed to collect project files from sandbox' 
      }, { status: 500 });
    }

    // Deploy to Vercel using their API
    const deployment = await deployToVercel(files, projectName);
    
    if (deployment.error) {
      return NextResponse.json({ 
        error: deployment.error 
      }, { status: 500 });
    }

    console.log('[deploy-vercel] Deployment successful:', deployment.url);

    return NextResponse.json({
      success: true,
      url: deployment.url,
      deploymentId: deployment.id,
      message: `Successfully deployed to ${deployment.url}`
    });

  } catch (error: any) {
    console.error('[deploy-vercel] Deployment failed:', error);
    return NextResponse.json({ 
      error: `Deployment failed: ${error.message}`,
      details: error.toString()
    }, { status: 500 });
  }
}

// Helper function to skip unnecessary files
function shouldSkipFile(filePath: string): boolean {
  const skipPatterns = [
    'node_modules/',
    '.git/',
    '.next/',
    'dist/',
    'build/',
    '.env',
    '.env.local',
    '.DS_Store',
    '*.log',
    'package-lock.json', // Vercel will regenerate this
    'yarn.lock',
    'pnpm-lock.yaml'
  ];

  return skipPatterns.some(pattern => {
    if (pattern.endsWith('/')) {
      return filePath.startsWith(pattern);
    } else if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filePath);
    } else {
      return filePath === pattern || filePath.endsWith('/' + pattern);
    }
  });
}

// Ensure essential files exist for deployment
async function ensureEssentialFiles(files: VercelFile[]): Promise<void> {
  const fileNames = files.map(f => f.file);

  // Ensure package.json exists
  if (!fileNames.includes('package.json')) {
    files.push({
      file: 'package.json',
      data: JSON.stringify({
        name: 'deployed-site',
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@vitejs/plugin-react': '^4.0.0',
          autoprefixer: '^10.4.14',
          postcss: '^8.4.24',
          tailwindcss: '^3.3.0',
          typescript: '^5.0.0',
          vite: '^4.4.0'
        }
      }, null, 2)
    });
  }

  // Ensure index.html exists
  if (!fileNames.includes('index.html')) {
    files.push({
      file: 'index.html',
      data: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Site</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    });
  }

  // Ensure vite.config.js exists
  if (!fileNames.some(f => f.startsWith('vite.config'))) {
    files.push({
      file: 'vite.config.js',
      data: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})`
    });
  }

  // Ensure main.tsx exists if no entry point found
  const hasEntryPoint = fileNames.some(f => 
    f.includes('main.') || f.includes('index.') || f.includes('App.')
  );
  
  if (!hasEntryPoint) {
    files.push({
      file: 'src/main.tsx',
      data: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    });

    files.push({
      file: 'src/App.tsx',
      data: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Site
        </h1>
        <p className="text-xl text-gray-600">
          Your site has been deployed successfully!
        </p>
      </div>
    </div>
  )
}

export default App`
    });

    files.push({
      file: 'src/index.css',
      data: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
    });
  }
}

// Deploy to Vercel using their API
async function deployToVercel(files: VercelFile[], projectName: string) {
  try {
    const deploymentPayload = {
      name: projectName,
      files,
      projectSettings: {
        framework: 'vite'
      },
      target: 'production'
    };

    console.log(`[deploy-vercel] Deploying ${files.length} files to Vercel...`);

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Using anonymous deployment - no auth token required
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[deploy-vercel] Vercel API error:', errorData);
      return { 
        error: `Vercel deployment failed: ${response.status} ${response.statusText}` 
      };
    }

    const deployment = await response.json();
    
    // Construct the deployment URL
    const deploymentUrl = `https://${deployment.url}`;
    
    return {
      success: true,
      url: deploymentUrl,
      id: deployment.id
    };

  } catch (error: any) {
    console.error('[deploy-vercel] Error calling Vercel API:', error);
    return { 
      error: `Failed to call Vercel API: ${error.message}` 
    };
  }
}