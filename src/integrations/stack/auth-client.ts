// Stack Auth Client (Neon Auth)
// Adapter para usar Stack Auth no lugar do Supabase Auth

import { StackServerApp } from "@stackframe/stack";

// Configuração do Stack Auth
const STACK_PROJECT_ID = import.meta.env.VITE_STACK_PROJECT_ID;
const STACK_PUBLISHABLE_CLIENT_KEY = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;
const STACK_SECRET_SERVER_KEY = import.meta.env.STACK_SECRET_SERVER_KEY;

if (!STACK_PROJECT_ID || !STACK_PUBLISHABLE_CLIENT_KEY) {
  console.warn('⚠️ Stack Auth não está configurado. Verifique as variáveis de ambiente:');
  console.warn('  - VITE_STACK_PROJECT_ID');
  console.warn('  - VITE_STACK_PUBLISHABLE_CLIENT_KEY');
}

// Cliente do Stack Auth para o servidor (se necessário)
export const stackServerApp = STACK_SECRET_SERVER_KEY 
  ? new StackServerApp({ 
      tokenStore: "nextjs-cookie",
      urls: {
        signIn: "/auth/sign-in",
        signUp: "/auth/sign-up",
        afterSignIn: "/",
        afterSignOut: "/auth",
      },
    })
  : null;

// Exportar configuração para uso no cliente
export const stackConfig = {
  projectId: STACK_PROJECT_ID,
  publishableClientKey: STACK_PUBLISHABLE_CLIENT_KEY,
};

// Helper para verificar se Stack Auth está configurado
export const isStackAuthConfigured = () => {
  return !!(STACK_PROJECT_ID && STACK_PUBLISHABLE_CLIENT_KEY);
};

