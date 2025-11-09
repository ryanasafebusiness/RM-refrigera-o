// Auth Adapter - Interface compatível com Supabase Auth usando Stack Auth
// Isso permite usar Stack Auth mantendo a mesma interface do código atual

import { useUser as useStackUser } from "@stackframe/stack";
import type { User } from "@stackframe/stack";

// Adapter para compatibilidade com Supabase Auth
export interface AuthSession {
  user: User | null;
  access_token?: string;
  expires_at?: number;
}

export interface AuthAdapter {
  getSession: () => Promise<{ data: { session: AuthSession | null }; error: Error | null }>;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: { user: User | null; session: AuthSession | null }; error: Error | null }>;
  signUp: (credentials: { email: string; password: string; options?: { data?: { name?: string } } }) => Promise<{ data: { user: User | null; session: AuthSession | null }; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  onAuthStateChange: (callback: (event: string, session: AuthSession | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
}

// Hook para usar Stack Auth
export const useAuth = () => {
  const user = useStackUser();
  
  return {
    user,
    loading: user === undefined,
    isAuthenticated: !!user,
  };
};

// Implementação do adapter (será criada quando Stack Auth estiver configurado)
export const createAuthAdapter = (): AuthAdapter => {
  // Esta implementação será completada após configurar Stack Auth
  throw new Error("Stack Auth adapter não implementado ainda. Configure Stack Auth primeiro.");
};

