# 🔐 Configurar Stack Auth (Neon Auth) no Projeto

## ✅ Credenciais Configuradas

- **Project ID**: `9b64165c-f180-4a72-997a-4f06729c0e90`
- **Publishable Client Key**: `pck_rtczhw0e40kjxyb528f6741zg0421t3zt8kk1v5n84n30`
- **Secret Server Key**: `ssk_4p2g1tjh4f7310se4w2wd87tdf60890mng5462mhyv9qg`
- **JWKS URL**: `https://api.stack-auth.com/api/v1/projects/9b64165c-f180-4a72-997a-4f06729c0e90/.well-known/jwks.json`

## 📋 Passo 1: Configurar Variáveis de Ambiente

Crie/edite o arquivo `.env` na raiz do projeto:

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Stack Auth (Neon Auth)
VITE_STACK_PROJECT_ID=9b64165c-f180-4a72-997a-4f06729c0e90
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_rtczhw0e40kjxyb528f6741zg0421t3zt8kk1v5n84n30
```

**⚠️ IMPORTANTE**: Para Vite, use `VITE_` como prefixo nas variáveis de ambiente!

## 📋 Passo 2: Adaptar App.tsx

O `App.tsx` precisa envolver a aplicação com `StackProvider`.

## 📋 Passo 3: Adaptar Página de Autenticação

A página `Auth.tsx` precisa usar os componentes do Stack Auth.

## 📋 Passo 4: Adaptar ProtectedRoute

O `ProtectedRoute` precisa verificar autenticação usando Stack Auth.

## 📋 Passo 5: Adaptar Queries do Banco

As queries do Supabase precisam ser adaptadas para usar PostgreSQL direto ou uma API backend.

---

## 🚧 Status

✅ Stack Auth instalado
✅ Cliente criado
⏳ Adaptando componentes...

---

## 📚 Documentação

- Stack Auth Docs: https://stack-auth.com/docs
- Neon Auth: https://neon.com/docs/auth

