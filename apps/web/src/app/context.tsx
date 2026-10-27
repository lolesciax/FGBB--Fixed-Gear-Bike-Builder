import { createContext, useContext } from 'react';
import type { SessionInfo } from '../services/api';
export type AuthMode = 'login' | 'register' | 'forgot';
export const AppContext = createContext<{ session: SessionInfo; refresh: () => Promise<unknown>; auth: (mode?: AuthMode) => void; notify: (message: string) => void } | null>(null);
export function useApp() { const context = useContext(AppContext); if (!context) throw new Error('App context is missing'); return context; }
export function errorMessage(error: unknown) {
  const e = error as { message?: string; details?: { resetAt?: string }; retryAfterSeconds?: number };
  return `${e.message || 'Something went wrong.'}${e.details?.resetAt ? ` Resets ${new Date(e.details.resetAt).toLocaleString()}.` : e.retryAfterSeconds ? ` Try again in ${Math.ceil(e.retryAfterSeconds / 60)} minutes.` : ''}`;
}
