# 🔐 Configurar Stack Auth (Neon Auth) - Guia Completo

## ✅ Credenciais Obtidas

- **Project ID**: `9b64165c-f180-4a72-997a-4f06729c0e90`
- **Publishable Client Key**: `pck_rtczhw0e40kjxyb528f6741zg0421t3zt8kk1v5n84n30`
- **Secret Server Key**: `ssk_4p2g1tjh4f7310se4w2wd87tdf60890mng5462mhyv9qg`
- **JWKS URL**: `https://api.stack-auth.com/api/v1/projects/9b64165c-f180-4a72-997a-4f06729c0e90/.well-known/jwks.json`

## 📋 Passo 1: Configurar Variáveis de Ambiente

**IMPORTANTE**: Crie o arquivo `.env` na raiz do projeto (`RM-refrigera-o-main/.env`):

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Stack Auth (Neon Auth) - Para Vite use VITE_ prefix
VITE_STACK_PROJECT_ID=9b64165c-f180-4a72-997a-4f06729c0e90
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_rtczhw0e40kjxyb528f6741zg0421t3zt8kk1v5n84n30
```

**⚠️ Lembre-se**: Para Vite, todas as variáveis devem ter o prefixo `VITE_` para serem acessíveis no frontend!

## 📋 Passo 2: Instalar Dependências

```bash
npm install @stackframe/stack@latest --legacy-peer-deps
```

✅ Já instalado!

## 📋 Passo 3: Adaptar Código

### 3.1 App.tsx
Já atualizado para incluir `StackProvider`.

### 3.2 Auth.tsx
Precisa ser adaptado para usar componentes do Stack Auth.

### 3.3 ProtectedRoute.tsx
Precisa ser adaptado para usar `useUser` do Stack Auth.

### 3.4 Queries do Banco
Precisa adaptar para usar PostgreSQL direto ou criar API backend.

## ⚠️ Limitações do Stack Auth com Vite

Stack Auth é otimizado para Next.js. Para Vite/React puro:

1. **Algumas funcionalidades podem ser limitadas** sem um backend
2. **Pode precisar criar uma API backend** para operações server-side
3. **Autenticação funciona no cliente**, mas algumas features podem precisar de backend

## 🚀 Próximos Passos

1. ✅ Configurar `.env` com as credenciais
2. ⏳ Adaptar `Auth.tsx` para usar Stack Auth
3. ⏳ Adaptar `ProtectedRoute.tsx` para usar Stack Auth
4. ⏳ Adaptar queries do banco (criar API backend ou usar PostgreSQL direto)
5. ⏳ Testar autenticação

## 📚 Documentação

- Stack Auth Docs: https://stack-auth.com/docs
- Neon Auth: https://neon.com/docs/auth
- Stack Auth GitHub: https://github.com/stackframejs/stack

---

## 🆘 Problemas Comuns

### Erro: "Stack Auth não está configurado"
- Verifique se o arquivo `.env` existe
- Verifique se as variáveis têm o prefixo `VITE_`
- Reinicie o servidor de desenvolvimento

### Erro: "createStackApp is not a function"
- Verifique se `@stackframe/stack` está instalado
- Verifique a versão: `npm list @stackframe/stack`

### Erro de compatibilidade com React
- Stack Auth pode requerer React 19
- Use `--legacy-peer-deps` ao instalar

---

**Após configurar o `.env`, me informe para continuar com a adaptação do código!**

