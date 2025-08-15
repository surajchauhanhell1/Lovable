import { useState, useCallback } from 'react';
import { CodeApplicationState } from '@/components/CodeApplicationProgress';

export const useCodeGeneration = () => {
  const [generationProgress, setGenerationProgress] = useState<{
    isGenerating: boolean;
    status: string;
    components: Array<{ name: string; path: string; completed: boolean }>;
    currentComponent: number;
    streamedCode: string;
    isStreaming: boolean;
    isThinking: boolean;
    thinkingText?: string;
    thinkingDuration?: number;
    currentFile?: { path: string; content: string; type: string };
    files: Array<{ path: string; content: string; type: string; completed: boolean }>;
    lastProcessedPosition: number;
    isEdit?: boolean;
  }>({
    isGenerating: false,
    status: '',
    components: [],
    currentComponent: 0,
    streamedCode: '',
    isStreaming: false,
    isThinking: false,
    files: [],
    lastProcessedPosition: 0
  });

  const [codeApplicationState, setCodeApplicationState] = useState<CodeApplicationState>({
    stage: null
  });

  const applyGeneratedCode = useCallback(async (code: string, isEdit: boolean = false) => {
    // ... implementation from AISandboxPage
  }, []);

  return {
    generationProgress,
    codeApplicationState,
    setGenerationProgress,
    setCodeApplicationState,
    applyGeneratedCode,
  };
};