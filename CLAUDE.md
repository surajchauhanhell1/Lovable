# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Use `pnpm` (preferred package manager)
- `pnpm install` - Install dependencies
- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint

### Testing
- `pnpm run test:integration` - Run E2B integration tests
- `pnpm run test:api` - Test API endpoints
- `pnpm run test:code` - Test code execution functionality
- `pnpm run test:all` - Run all tests sequentially

## Architecture Overview

### Core Technology Stack
- **Next.js 15.4.3** with App Router architecture
- **React 19** with modern features
- **TypeScript** for type safety
- **Tailwind CSS** with Tailwind CSS v4.1.11
- **E2B Code Interpreter** for sandbox execution
- **AI SDKs**: Anthropic, OpenAI, Groq integration

### Project Structure
- `app/` - Next.js App Router pages and API routes
- `app/api/` - API endpoints for sandbox management, AI integration
- `components/` - Reusable React components
- `lib/` - Utility functions and shared logic
- `types/` - TypeScript type definitions
- `config/` - Application configuration
- `docs/` - Internal documentation

### Key Components

#### Sandbox Management (`app/api/`)
- `create-ai-sandbox/` - Creates E2B sandboxes for code execution
- `apply-ai-code/` & `apply-ai-code-stream/` - Apply AI-generated code with streaming
- `install-packages/` - Automatically install npm packages
- `get-sandbox-files/` - Retrieve sandbox file structure
- `run-command/` - Execute commands in sandbox
- `deploy-to-vercel/` - Deploy sandbox projects to live Vercel URLs
- `generate-component-library/` - Create comprehensive component libraries

#### AI Integration
- Uses multiple AI providers (Anthropic, OpenAI, Groq)
- Default model: `moonshotai/kimi-k2-instruct` (Groq)
- Streaming responses with real-time feedback
- XML-based package detection system

#### Package Detection System
The app uses XML tags in AI responses for automatic package management:
- `<package>package-name</package>` - Single package
- `<packages>pkg1, pkg2, pkg3</packages>` - Multiple packages
- `<command>npm run build</command>` - Execute commands
- See `docs/PACKAGE_DETECTION_GUIDE.md` for complete documentation

#### Configuration (`config/app.config.ts`)
- E2B sandbox timeout: 15 minutes
- Vite development server on port 5173
- AI model settings and temperature
- Package installation with `--legacy-peer-deps`

### Core Workflows

#### Code Generation Flow
1. User submits request via chat interface
2. AI analyzes request and generates code with XML tags
3. System parses XML for packages, files, and commands
4. Packages automatically installed in sandbox
5. Files created/updated with real-time streaming feedback
6. Commands executed with output streaming

#### Deployment Flow
1. User clicks deploy button in sandbox toolbar
2. System collects all project files from E2B sandbox
3. Essential files auto-generated if missing (package.json, vite.config, etc.)
4. Files bundled and sent to Vercel deployment API
5. Live URL returned and auto-opened in new tab
6. User can share live website instantly

#### Sandbox Lifecycle
- Sandboxes auto-created on first interaction
- 15-minute timeout with automatic cleanup
- Vite dev server runs on port 5173
- File changes trigger automatic rebuilds

### Environment Variables Required
```env
E2B_API_KEY=your_e2b_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key  # Optional
OPENAI_API_KEY=your_openai_api_key        # Optional  
GROQ_API_KEY=your_groq_api_key           # Optional
```

### Important Implementation Details

#### File Import Paths
- Uses `@/*` alias for root-level imports
- All components use centralized icon imports from `@/lib/icons`
- Avoid direct icon library imports to prevent Turbopack chunk issues

#### Hydration and State Management
- Client-side state initialization to prevent hydration errors
- Uses loading state during hydration for consistent rendering
- Session storage persistence for UI state (home screen visibility)

#### Error Handling
- Comprehensive streaming error feedback
- Automatic truncation recovery (disabled by default)
- Vite error monitoring and reporting system

#### Performance Considerations
- Uses Turbopack for fast development builds
- Streaming responses for real-time user feedback
- File caching for sandbox state management
- CSS rebuild delays (2000ms) for styling changes

### Key Utilities

#### `lib/file-parser.ts`
- Parses AI responses for file content extraction
- Handles XML tag parsing for packages and commands

#### `lib/edit-intent-analyzer.ts` 
- Analyzes user requests for edit intentions
- Determines file targets and edit types

#### `components/CodeApplicationProgress.tsx`
- Real-time progress display for code application
- Shows package installation, file creation, and command execution status

### Testing Strategy
- Integration tests for E2B sandbox functionality
- API endpoint testing for all routes  
- Code execution validation
- Error handling verification