# ⚡ Quick Start - Backend API

## 🎯 Passo a Passo Rápido

### 1. Instalar Dependências do Backend

```bash
cd backend
npm install
```

### 2. Criar Arquivo `.env` no Backend

Crie `backend/.env`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=gerar-chave-secreta-aqui
PORT=3001
FRONTEND_URL=http://localhost:8080
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurar Frontend

Adicione ao `.env` do frontend (raiz do projeto):

```env
VITE_API_URL=http://localhost:3001
```

### 4. Iniciar Backend

```bash
cd backend
npm run dev
```

### 5. Iniciar Frontend (em outro terminal)

```bash
npm run dev
```

## ✅ Testar

1. Acesse: http://localhost:8080
2. Clique em "Cadastro"
3. Crie uma conta
4. Faça login
5. Teste criar uma ordem de serviço

## 🐛 Problemas?

### Backend não inicia
- Verifique se o `.env` existe
- Verifique se `DATABASE_URL` está correto
- Verifique se as dependências foram instaladas

### Erro de conexão
- Verifique se o backend está rodando em `http://localhost:3001`
- Verifique se `VITE_API_URL` está configurado no frontend
- Verifique o console do navegador para erros

### Erro de autenticação
- Verifique se o token está sendo salvo no localStorage
- Verifique se o `JWT_SECRET` está configurado
- Faça login novamente

---

**🚀 Pronto! Agora você tem uma API backend funcionando!**

