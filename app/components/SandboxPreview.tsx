import { useSandbox } from '@/hooks/useSandbox';

export const SandboxPreview = () => {
  const { sandboxData } = useSandbox();

  // ... render sandbox preview iframe and screenshot

  return <div>...</div>;
};