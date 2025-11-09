// Stack Auth Client for React/Vite
// Adaptado para funcionar sem Next.js

import { createStackApp } from "@stackframe/stack";

// Configuração do Stack Auth
const STACK_PROJECT_ID = import.meta.env.VITE_STACK_PROJECT_ID;
const STACK_PUBLISHABLE_CLIENT_KEY = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

if (!STACK_PROJECT_ID || !STACK_PUBLISHABLE_CLIENT_KEY) {
  console.warn('⚠️ Stack Auth não está configurado. Verifique as variáveis de ambiente:');
  console.warn('  - VITE_STACK_PROJECT_ID');
  console.warn('  - VITE_STACK_PUBLISHABLE_CLIENT_KEY');
}

// Criar instância do Stack App
export const stackApp = createStackApp({
  projectId: STACK_PROJECT_ID || '',
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY || '',
  urls: {
    signIn: "/auth",
    signUp: "/auth",
    afterSignIn: "/dashboard",
    afterSignOut: "/auth",
  },
});

// Helper para verificar se Stack Auth está configurado
export const isStackAuthConfigured = () => {
  return !!(STACK_PROJECT_ID && STACK_PUBLISHABLE_CLIENT_KEY);
};

// Exportar hooks do Stack Auth
export const useUser = stackApp.useUser;
export const useSignIn = stackApp.useSignIn;
export const useSignUp = stackApp.useSignUp;
export const useSignOut = stackApp.useSignOut;

