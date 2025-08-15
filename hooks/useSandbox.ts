import { useState, useCallback } from 'react';

export interface SandboxData {
  sandboxId: string;
  url: string;
  [key: string]: any;
}

export const useSandbox = () => {
  const [sandboxData, setSandboxData] = useState<SandboxData | null>(null);
  const [status, setStatus] = useState({ text: 'Not connected', active: false });
  const [structureContent, setStructureContent] = useState('No sandbox created yet');

  const updateStatus = useCallback((text: string, active: boolean) => {
    setStatus({ text, active });
  }, []);

  const createSandbox = useCallback(async () => {
    // ... implementation from AISandboxPage
  }, []);

  const checkSandboxStatus = useCallback(async () => {
    // ... implementation from AISandboxPage
  }, []);

  const fetchSandboxFiles = useCallback(async () => {
    // ... implementation from AISandboxPage
  }, []);

  return {
    sandboxData,
    status,
    structureContent,
    updateStatus,
    createSandbox,
    checkSandboxStatus,
    fetchSandboxFiles,
  };
};