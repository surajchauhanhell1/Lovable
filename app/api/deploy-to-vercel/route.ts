import { NextRequest, NextResponse } from 'next/server';
import type { SandboxState } from '@/types/sandbox';

interface DeploymentRequest {
  sandboxId?: string;
  projectName?: string;
  files?: Array<{
    path: string;
    content: string;
  }>;
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

// Add a simple health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Deploy to Vercel endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: DeploymentRequest = await req.json();
    const { projectName = 'my-site', sandboxId, files: requestFiles } = body;

    console.log('[deploy-vercel] Starting deployment process...');
    console.log('[deploy-vercel] Request body:', { 
      projectName, 
      sandboxId, 
      filesCount: requestFiles?.length || 0 
    });

    // Get all files for deployment
    const files: VercelFile[] = [];
    
    try {
      if (requestFiles && requestFiles.length > 0) {
        // Use files sent from frontend
        console.log('[deploy-vercel] Using files from request');
        console.log('[deploy-vercel] First few files:', requestFiles.slice(0, 3));
        
        for (const file of requestFiles) {
          // Validate file structure
          if (!file.path || !file.content) {
            console.warn(`[deploy-vercel] Skipping invalid file:`, file);
            continue;
          }
          
          if (!shouldSkipFile(file.path)) {
            files.push({ file: file.path, data: file.content });
          } else {
            console.log(`[deploy-vercel] Skipping file: ${file.path}`);
          }
        }
        
        console.log(`[deploy-vercel] Processed ${files.length} valid files from request`);
      } else {
        // Fallback: try to get files from global state (for development)
        console.log('[deploy-vercel] No files in request, checking global state...');
        
        // Check if we're in development and have access to sandbox
        if (typeof global !== 'undefined' && global.sandboxState?.fileCache?.files) {
          const cachedFiles = global.sandboxState.fileCache.files;
          console.log('[deploy-vercel] Using cached files from sandboxState');
          for (const [path, fileData] of Object.entries(cachedFiles)) {
            if (!shouldSkipFile(path)) {
              const content = (fileData as any).content as string;
              files.push({ file: path, data: content });
            }
          }
        } else if (typeof global !== 'undefined' && global.activeSandbox) {
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
          console.warn('[deploy-vercel] No files provided and no global sandbox state available');
          return NextResponse.json({ 
            error: 'No files provided for deployment. Please ensure your project has been generated and try again.' 
          }, { status: 400 });
        }
      }

      // Ensure we have essential files for a React/Vite project
      await ensureEssentialFiles(files);

      console.log(`[deploy-vercel] Collected ${files.length} files for deployment`);
      console.log('[deploy-vercel] File paths:', files.map(f => f.file));
      
      // Validate that we have the minimum required files
      if (files.length === 0) {
        console.error('[deploy-vercel] No files available for deployment');
        return NextResponse.json({ 
          error: 'No files available for deployment. Please ensure your project has been generated.' 
        }, { status: 400 });
      }
      
      // Check for essential files
      const hasPackageJson = files.some(f => f.file === 'package.json');
      const hasIndexHtml = files.some(f => f.file === 'index.html');
      const hasMainEntry = files.some(f => f.file.includes('main.') || f.file.includes('index.') || f.file.includes('App.'));
      
      if (!hasPackageJson || !hasIndexHtml || !hasMainEntry) {
        console.warn('[deploy-vercel] Missing essential files, but continuing with generated defaults');
      }

    } catch (error) {
      console.error('[deploy-vercel] Error collecting files:', error);
      return NextResponse.json({ 
        error: 'Failed to collect project files for deployment' 
      }, { status: 500 });
    }

    // Deploy to Vercel using their API
    const deployment = await deployToVercel(files, projectName);
    
    if (deployment.error) {
      console.error('[deploy-vercel] Vercel deployment failed:', deployment.error);
      return NextResponse.json({ 
        error: deployment.error 
      }, { status: 500 });
    }

    // This code will work when you add a Vercel token and uncomment the deployment code
    // For now, this will never be reached since deployment always returns an error
    return NextResponse.json({
      success: false,
      error: 'Deployment not implemented yet. Please add your Vercel token to enable deployment.'
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
    console.log('[deploy-vercel] Project name:', projectName);
    console.log('[deploy-vercel] Deployment payload size:', JSON.stringify(deploymentPayload).length, 'bytes');

    // Note: Vercel requires authentication for deployments
    // For now, we'll return an error explaining this
    // In the future, users can add their Vercel token to deploy
    return {
      error: 'Vercel deployment requires authentication. Please add your Vercel token to deploy. For now, you can download your project as a ZIP file and deploy manually.'
    };
    
    // Uncomment the code below when you have a Vercel token
    /*
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      },
      body: JSON.stringify(deploymentPayload)
    });

    console.log('[deploy-vercel] Vercel API response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData = '';
      try {
        errorData = await response.text();
      } catch (e) {
        errorData = 'Could not read error response';
      }
      
      console.error('[deploy-vercel] Vercel API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      return { 
        error: `Vercel deployment failed: ${response.status} ${response.statusText}. ${errorData}` 
      };
    }

    let deployment;
    try {
      deployment = await response.json();
      console.log('[deploy-vercel] Vercel deployment response:', deployment);
    } catch (e) {
      console.error('[deploy-vercel] Failed to parse Vercel response:', e);
      return {
        error: 'Failed to parse Vercel deployment response'
      };
    }
    
    // Construct the deployment URL
    const deploymentUrl = `https://${deployment.url}`;
    console.log('[deploy-vercel] Final deployment URL:', deploymentUrl);
    
    return {
      success: true,
      url: deploymentUrl,
      id: deployment.id
    };
    */

  } catch (error: any) {
    console.error('[deploy-vercel] Error calling Vercel API:', error);
    return { 
      error: `Failed to call Vercel API: ${error.message}` 
    };
  }
}