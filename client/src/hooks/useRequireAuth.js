import { useContext } from 'react';
import { AuthPromptContext } from '@/context/AuthPromptContext';

/** `const { requireAuth } = useRequireAuth();` — see AuthPromptProvider. */
export function useRequireAuth() {
  const context = useContext(AuthPromptContext);
  if (!context) throw new Error('useRequireAuth must be used inside <AuthPromptProvider>.');
  return context;
}
