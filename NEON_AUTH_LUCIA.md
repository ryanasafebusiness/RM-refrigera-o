# 🔐 Configurar Autenticação com Lucia Auth + Neon

## ✅ Por Que Lucia Auth?

- ✅ Compatível com Vite + React 18
- ✅ Funciona diretamente com PostgreSQL (Neon)
- ✅ Não precisa de Next.js
- ✅ Leve e flexível
- ✅ Open source

## 📋 Passo 1: Instalar Dependências

```bash
npm install lucia @lucia-auth/adapter-postgresql pg
npm install -D @types/pg
```

## 📋 Passo 2: Configurar Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Lucia Auth Secret (gere uma string aleatória)
LUCIA_SECRET=sua_chave_secreta_aqui_32_caracteres_minimo
```

**Para gerar uma chave secreta:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Passo 3: Criar Tabelas de Autenticação

Execute no SQL Editor do Neon:

```sql
-- Tabela de usuários (já existe, mas vamos adaptar)
-- A tabela 'users' já foi criada nas migrações

-- Tabela de sessões (Lucia Auth)
CREATE TABLE IF NOT EXISTS public.user_session (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de chaves (Lucia Auth)
CREATE TABLE IF NOT EXISTS public.user_key (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hashed_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON public.user_session(user_id);
CREATE INDEX IF NOT EXISTS idx_user_key_user_id ON public.user_key(user_id);
```

## 📋 Passo 4: Configurar Lucia Auth

Vou criar os arquivos de configuração do Lucia Auth.

## 📋 Passo 5: Adaptar Código

Vou adaptar os componentes para usar Lucia Auth em vez de Supabase Auth.

---

## 🚧 Próximos Passos

Após instalar as dependências e executar o SQL acima, me informe para continuar com a configuração!

---

## 📚 Referências

- Lucia Auth Docs: https://lucia-auth.com
- Neon + Lucia: https://neon.com/blog/authenticating-users-in-astro-using-neon-postgres-and-lucia-auth

