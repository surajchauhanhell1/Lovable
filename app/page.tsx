'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/app/components/theme-toggle';
import { ThemeLogo } from '@/app/components/theme-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Loader2, 
  ExternalLink, 
  RefreshCw, 
  Download,
  Zap,
  Code,
  Palette,
  Sparkles,
  Camera,
  Globe,
  FileText,
  Wand2
} from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface SandboxData {
  sandboxId: string;
  url: string;
}

interface DesignStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

interface CodeApplicationState {
  stage: 'analyzing' | 'installing' | 'applying' | 'complete' | null;
  packages?: string[];
  installedPackages?: string[];
  filesGenerated?: string[];
  message?: string;
}

// Design styles configuration
const DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'modern',
    name: 'Modern & Clean',
    description: 'Minimalist design with clean lines and plenty of white space',
    prompt: 'Create a modern, minimalist design with clean typography, subtle shadows, and plenty of white space. Use a neutral color palette with accent colors.'
  },
  {
    id: 'vibrant',
    name: 'Vibrant & Bold',
    description: 'Eye-catching colors and dynamic layouts',
    prompt: 'Design with vibrant colors, bold typography, and dynamic layouts. Use gradients, bright accent colors, and engaging visual elements.'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate-friendly with structured layouts',
    prompt: 'Create a professional, corporate design with structured layouts, conservative colors, and clear hierarchy. Focus on readability and trust.'
  },
  {
    id: 'creative',
    name: 'Creative & Artistic',
    description: 'Unique layouts with artistic flair',
    prompt: 'Design with creative layouts, artistic elements, unique typography, and innovative use of space. Be experimental and visually interesting.'
  }
];

// Available AI models
const AI_MODELS = [
  { value: 'moonshotai/kimi-k2-instruct', label: 'Kimi K2 Instruct (Recommended)' },
  { value: 'anthropic/claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'openai/gpt-5', label: 'GPT-5' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' }
];

export default function AISandboxPage() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sandboxData, setSandboxData] = useState<SandboxData | null>(null);
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('moonshotai/kimi-k2-instruct');
  const [selectedDesignStyle, setSelectedDesignStyle] = useState<string>('');
  const [includeDesignStyle, setIncludeDesignStyle] = useState(false);
  const [codeApplicationState, setCodeApplicationState] = useState<CodeApplicationState>({ stage: null });
  const [iframeKey, setIframeKey] = useState(0);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize page
  useEffect(() => {
    const initializePage = async () => {
      console.log('[AISandboxPage] Initializing...');
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'system',
        content: 'Welcome to Open Lovable! Create a sandbox to start building React apps with AI.',
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);

      // Check if sandbox already exists
      try {
        const statusResponse = await fetch('/api/sandbox-status');
        const statusData = await statusResponse.json();
        
        if (statusData.success && statusData.active && statusData.healthy) {
          console.log('[AISandboxPage] Found existing healthy sandbox');
          setSandboxData(statusData.sandboxData);
          
          const reconnectMessage: Message = {
            id: 'reconnect',
            role: 'system',
            content: 'Reconnected to existing sandbox. You can continue building!',
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, reconnectMessage]);
        }
      } catch (error) {
        console.log('[AISandboxPage] No existing sandbox found');
      }
    };

    initializePage();
  }, []);

  // Create sandbox
  const createSandbox = async () => {
    if (isSandboxLoading) return;
    
    setIsSandboxLoading(true);
    
    try {
      console.log('[createSandbox] Creating new sandbox...');
      
      const response = await fetch('/api/create-ai-sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        setSandboxData({
          sandboxId: data.sandboxId,
          url: data.url
        });
        
        const successMessage: Message = {
          id: `sandbox-${Date.now()}`,
          role: 'system',
          content: `✅ Sandbox created successfully! Your React app is ready at: ${data.url}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // Force iframe refresh
        setIframeKey(prev => prev + 1);
      } else {
        throw new Error(data.error || 'Failed to create sandbox');
      }
    } catch (error) {
      console.error('[createSandbox] Error:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `❌ Failed to create sandbox: ${(error as Error).message}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSandboxLoading(false);
    }
  };

  // Kill sandbox
  const killSandbox = async () => {
    try {
      const response = await fetch('/api/kill-sandbox', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSandboxData(null);
        setIframeKey(prev => prev + 1);
        
        const killMessage: Message = {
          id: `kill-${Date.now()}`,
          role: 'system',
          content: '🔄 Sandbox terminated. Create a new one to continue.',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, killMessage]);
      }
    } catch (error) {
      console.error('[killSandbox] Error:', error);
    }
  };

  // Refresh iframe
  const refreshIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  // Capture screenshot
  const captureScreenshot = async () => {
    if (!sandboxData?.url || isCapturingScreenshot) return;
    
    setIsCapturingScreenshot(true);
    
    try {
      const response = await fetch('/api/scrape-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: sandboxData.url
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.screenshot) {
        setScreenshotUrl(data.screenshot);
        
        const screenshotMessage: Message = {
          id: `screenshot-${Date.now()}`,
          role: 'system',
          content: '📸 Screenshot captured successfully!',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, screenshotMessage]);
      } else {
        throw new Error(data.error || 'Failed to capture screenshot');
      }
    } catch (error) {
      console.error('[captureScreenshot] Error:', error);
      
      const errorMessage: Message = {
        id: `screenshot-error-${Date.now()}`,
        role: 'system',
        content: `❌ Failed to capture screenshot: ${(error as Error).message}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Download project
  const downloadProject = async () => {
    if (!sandboxData) return;
    
    try {
      const response = await fetch('/api/create-zip', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.dataUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        const downloadMessage: Message = {
          id: `download-${Date.now()}`,
          role: 'system',
          content: '📦 Project downloaded successfully!',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, downloadMessage]);
      }
    } catch (error) {
      console.error('[downloadProject] Error:', error);
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setCodeApplicationState({ stage: null });
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      // Prepare the prompt
      let finalPrompt = userMessage.content;
      
      // Add design style if selected
      if (includeDesignStyle && selectedDesignStyle) {
        const designStyle = DESIGN_STYLES.find(style => style.id === selectedDesignStyle);
        if (designStyle) {
          finalPrompt = `${designStyle.prompt}\n\nUser Request: ${finalPrompt}`;
        }
      }
      
      // Add screenshot context if available
      if (screenshotUrl) {
        finalPrompt = `Current app screenshot: ${screenshotUrl}\n\n${finalPrompt}`;
      }
      
      const response = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          model: selectedModel,
          sandboxId: sandboxData?.sandboxId
        }),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                assistantMessage.content += data.content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                );
              } else if (data.type === 'package') {
                setCodeApplicationState(prev => ({
                  ...prev,
                  stage: 'installing',
                  packages: [...(prev.packages || []), data.name]
                }));
              } else if (data.type === 'applying') {
                setCodeApplicationState(prev => ({
                  ...prev,
                  stage: 'applying',
                  message: data.message
                }));
              } else if (data.type === 'complete') {
                setCodeApplicationState({ stage: 'complete' });
                // Refresh iframe after code application
                setTimeout(() => {
                  setIframeKey(prev => prev + 1);
                }, 2000);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      
      // Mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[sendMessage] Request aborted');
        return;
      }
      
      console.error('[sendMessage] Error:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `❌ Error: ${error.message}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCodeApplicationState({ stage: null });
      abortControllerRef.current = null;
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeLogo />
              <div>
                <h1 className="text-xl font-bold">Open Lovable</h1>
                <p className="text-sm text-muted-foreground">AI-powered React app builder</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <Select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-48"
              >
                {AI_MODELS.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </Select>
              
              {/* Sandbox Controls */}
              {!sandboxData ? (
                <Button 
                  onClick={createSandbox} 
                  disabled={isSandboxLoading}
                  variant="orange"
                  className="gap-2"
                >
                  {isSandboxLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Create Sandbox
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={refreshIframe} 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={captureScreenshot} 
                    variant="outline" 
                    size="sm"
                    disabled={isCapturingScreenshot}
                    className="gap-2"
                  >
                    {isCapturingScreenshot ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    Screenshot
                  </Button>
                  <Button 
                    onClick={downloadProject} 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button 
                    onClick={killSandbox} 
                    variant="destructive" 
                    size="sm"
                  >
                    Kill Sandbox
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Chat Panel */}
          <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm">
            {/* Design Style Selector */}
            <div className="p-4 border-b border-border bg-white/80 backdrop-blur-sm rounded-t-xl">
              <div className="flex items-center gap-2 mb-3">
                <Checkbox 
                  checked={includeDesignStyle}
                  onChange={setIncludeDesignStyle}
                />
                <span className="text-sm font-medium">Apply design style</span>
              </div>
              
              {includeDesignStyle && (
                <div className="grid grid-cols-2 gap-2">
                  {DESIGN_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedDesignStyle(style.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedDesignStyle === style.id
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{style.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-[#36322F] text-white'
                          : message.role === 'system'
                          ? 'bg-[#36322F] text-white text-sm'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Code Application Progress */}
              <AnimatePresence>
                {codeApplicationState.stage && codeApplicationState.stage !== 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4"
                        >
                          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                            <circle 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round"
                              strokeDasharray="31.416"
                              strokeDashoffset="10"
                              className="text-gray-700"
                            />
                          </svg>
                        </motion.div>
                        <div className="text-sm font-medium text-gray-700">
                          {codeApplicationState.stage === 'analyzing' && 'Analyzing code...'}
                          {codeApplicationState.stage === 'installing' && `Installing packages: ${codeApplicationState.packages?.join(', ') || ''}`}
                          {codeApplicationState.stage === 'applying' && (codeApplicationState.message || 'Applying code...')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={sandboxData ? "Describe what you want to build..." : "Create a sandbox first to start building"}
                  disabled={!sandboxData || isLoading}
                  className="flex-1 min-h-[44px] max-h-32 resize-none"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!sandboxData || !inputValue.trim() || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Live Preview</span>
                {sandboxData && (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {sandboxData.url}
                  </code>
                )}
              </div>
              {sandboxData && (
                <a
                  href={sandboxData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="flex-1 bg-white">
              {sandboxData ? (
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={sandboxData.url}
                  className="w-full h-full border-0"
                  title="App Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Sandbox Active</p>
                    <p className="text-sm">Create a sandbox to see your app preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}