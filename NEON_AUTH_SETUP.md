# 🔐 Configurar Neon Auth (Stack Auth)

## ✅ Passo 1: Habilitar Neon Auth no Projeto

1. **Acesse o Dashboard do Neon**
   - Vá para: https://console.neon.tech
   - Abra seu projeto "Rm Refrigera"

2. **Habilitar Neon Auth**
   - No menu lateral, procure por "Auth" ou "Neon Auth"
   - Clique em "Enable Neon Auth" ou "Configure Auth"
   - Siga as instruções na tela

3. **Obter Credenciais**
   - Após habilitar, você receberá:
     - `STACK_PROJECT_ID`
     - `STACK_PUBLISHABLE_CLIENT_KEY`
     - `STACK_SECRET_SERVER_KEY`
   - **Copie essas credenciais!**

## ✅ Passo 2: Instalar Dependências

```bash
npm install @stackframe/stack
```

## ✅ Passo 3: Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Neon Auth (Stack Auth)
NEXT_PUBLIC_STACK_PROJECT_ID=seu_project_id_aqui
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=sua_publishable_key_aqui
STACK_SECRET_SERVER_KEY=sua_secret_key_aqui
```

**⚠️ IMPORTANTE**: Para Vite (não Next.js), use `VITE_` em vez de `NEXT_PUBLIC_`:

```env
VITE_STACK_PROJECT_ID=seu_project_id_aqui
VITE_STACK_PUBLISHABLE_CLIENT_KEY=sua_publishable_key_aqui
STACK_SECRET_SERVER_KEY=sua_secret_key_aqui
```

## ✅ Passo 4: Criar Cliente Stack Auth

Vou criar um adapter para usar Stack Auth mantendo compatibilidade com o código existente.

## ✅ Passo 5: Adaptar Código

O código atual usa Supabase Auth. Precisaremos adaptar para usar Stack Auth.

---

## 🚧 Próximos Passos

Após habilitar Neon Auth no dashboard e obter as credenciais, me informe para eu adaptar o código!

---

## 📚 Referências

- Documentação Neon Auth: https://neon.com/docs/auth
- Stack Auth Docs: https://stack-auth.com/docs
- GitHub: https://github.com/stackframejs/stack

