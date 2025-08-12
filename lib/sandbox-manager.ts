import { Sandbox } from '@e2b/code-interpreter';
import { appConfig } from '@/config/app.config';

export interface SandboxInfo {
  sandboxId: string;
  url: string;
  createdAt: Date;
  lastHealthCheck: Date;
  isHealthy: boolean;
}

class SandboxManager {
  private static instance: SandboxManager;
  private activeSandbox: any = null;
  private sandboxInfo: SandboxInfo | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  private constructor() {}

  static getInstance(): SandboxManager {
    if (!SandboxManager.instance) {
      SandboxManager.instance = new SandboxManager();
    }
    return SandboxManager.instance;
  }

  async createSandbox(): Promise<SandboxInfo> {
    try {
      console.log('[SandboxManager] Creating new sandbox...');
      
      // Kill existing sandbox if any
      await this.killSandbox();
      
      // Create new sandbox
      const sandbox = await Sandbox.create({ 
        apiKey: process.env.E2B_API_KEY,
        timeoutMs: appConfig.e2b.timeoutMs
      });
      
      const sandboxId = (sandbox as any).sandboxId || Date.now().toString();
      const host = (sandbox as any).getHost(appConfig.e2b.vitePort);
      
      console.log(`[SandboxManager] Sandbox created: ${sandboxId}`);
      
      // Set up Vite React app
      await this.setupViteApp(sandbox);
      
      // Store sandbox info
      this.activeSandbox = sandbox;
      this.sandboxInfo = {
        sandboxId,
        url: `https://${host}`,
        createdAt: new Date(),
        lastHealthCheck: new Date(),
        isHealthy: true
      };
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log(`[SandboxManager] Sandbox ready at: ${this.sandboxInfo.url}`);
      return this.sandboxInfo;
      
    } catch (error) {
      console.error('[SandboxManager] Failed to create sandbox:', error);
      throw error;
    }
  }

  private async setupViteApp(sandbox: any): Promise<void> {
    console.log('[SandboxManager] Setting up Vite React app...');
    
    const setupScript = `
import os
import json
import subprocess
import time

print('Setting up React app with Vite and Tailwind...')

# Create directory structure
os.makedirs('/home/user/app/src', exist_ok=True)

# Package.json
package_json = {
    "name": "sandbox-app",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite --host",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    "devDependencies": {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^4.3.9",
        "tailwindcss": "^3.3.0",
        "postcss": "^8.4.31",
        "autoprefixer": "^10.4.16"
    }
}

with open('/home/user/app/package.json', 'w') as f:
    json.dump(package_json, f, indent=2)
print('✓ package.json')

# Vite config
vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      port: 5173
    }
  }
})"""

with open('/home/user/app/vite.config.js', 'w') as f:
    f.write(vite_config)
print('✓ vite.config.js')

# Tailwind config
tailwind_config = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}"""

with open('/home/user/app/tailwind.config.js', 'w') as f:
    f.write(tailwind_config)
print('✓ tailwind.config.js')

# PostCSS config
postcss_config = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""

with open('/home/user/app/postcss.config.js', 'w') as f:
    f.write(postcss_config)
print('✓ postcss.config.js')

# HTML file
html_content = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>"""

with open('/home/user/app/index.html', 'w') as f:
    f.write(html_content)
print('✓ index.html')

# CSS file
css_content = """@tailwind base;
@tailwind components;
@tailwind utilities;"""

with open('/home/user/app/src/index.css', 'w') as f:
    f.write(css_content)
print('✓ index.css')

# Main React entry point
main_content = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)"""

with open('/home/user/app/src/main.jsx', 'w') as f:
    f.write(main_content)
print('✓ main.jsx')

# App component
app_content = """import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your React App
        </h1>
        <p className="text-gray-600">
          Start building something amazing!
        </p>
      </div>
    </div>
  )
}

export default App"""

with open('/home/user/app/src/App.jsx', 'w') as f:
    f.write(app_content)
print('✓ App.jsx')

# Install dependencies
print('Installing dependencies...')
os.chdir('/home/user/app')
result = subprocess.run(['npm', 'install'], capture_output=True, text=True)
if result.returncode == 0:
    print('✓ Dependencies installed')
else:
    print('⚠ Dependencies installation had issues:', result.stderr)

# Start Vite dev server
print('Starting Vite dev server...')
env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'✓ Vite dev server started with PID: {process.pid}')
print('Waiting for server to be ready...')
time.sleep(5)
print('✓ Setup complete!')
    `;
    
    await sandbox.runCode(setupScript);
    
    // Wait for Vite to be ready
    await new Promise(resolve => setTimeout(resolve, appConfig.e2b.viteStartupDelay));
  }

  async getSandboxStatus(): Promise<{ active: boolean; healthy: boolean; sandboxInfo: SandboxInfo | null }> {
    if (!this.activeSandbox || !this.sandboxInfo) {
      return { active: false, healthy: false, sandboxInfo: null };
    }

    try {
      // Simple health check - try to access the sandbox
      const isHealthy = await this.checkSandboxHealth();
      
      this.sandboxInfo.isHealthy = isHealthy;
      this.sandboxInfo.lastHealthCheck = new Date();
      
      return {
        active: true,
        healthy: isHealthy,
        sandboxInfo: this.sandboxInfo
      };
    } catch (error) {
      console.error('[SandboxManager] Health check failed:', error);
      this.sandboxInfo.isHealthy = false;
      return {
        active: true,
        healthy: false,
        sandboxInfo: this.sandboxInfo
      };
    }
  }

  private async checkSandboxHealth(): Promise<boolean> {
    try {
      // Try to run a simple command to check if sandbox is responsive
      await this.activeSandbox.runCode('print("health_check")');
      return true;
    } catch (error) {
      return false;
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        const status = await this.getSandboxStatus();
        if (!status.healthy && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log('[SandboxManager] Sandbox unhealthy, attempting recovery...');
          await this.attemptRecovery();
        }
      } catch (error) {
        console.error('[SandboxManager] Health monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private async attemptRecovery(): Promise<void> {
    try {
      this.reconnectAttempts++;
      console.log(`[SandboxManager] Recovery attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // Try to recreate the sandbox
      await this.createSandbox();
      this.reconnectAttempts = 0;
      console.log('[SandboxManager] Recovery successful');
    } catch (error) {
      console.error('[SandboxManager] Recovery failed:', error);
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[SandboxManager] Max recovery attempts reached, giving up');
        await this.killSandbox();
      }
    }
  }

  async killSandbox(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      
      if (this.activeSandbox) {
        await this.activeSandbox.kill();
        this.activeSandbox = null;
      }
      
      this.sandboxInfo = null;
      this.reconnectAttempts = 0;
      
      console.log('[SandboxManager] Sandbox killed');
    } catch (error) {
      console.error('[SandboxManager] Error killing sandbox:', error);
    }
  }

  getCurrentSandbox(): { sandbox: any; info: SandboxInfo | null } {
    return {
      sandbox: this.activeSandbox,
      info: this.sandboxInfo
    };
  }
}

export default SandboxManager;
