# 📦 Instalar e Configurar Backend

## ✅ O Que Foi Criado

1. ✅ **Backend API completa** (Express.js + JWT + Neon)
2. ✅ **Frontend adaptado** para usar a API
3. ✅ **Autenticação JWT** implementada
4. ✅ **Endpoints de Service Orders** criados

## 🚀 Instalação Rápida

### Passo 1: Instalar Dependências do Backend

```bash
cd backend
npm install
```

### Passo 2: Criar Arquivo `.env` do Backend

Crie o arquivo `backend/.env`:

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (gere uma chave aleatória)
JWT_SECRET=gerar-chave-secreta-aqui-minimo-32-caracteres

# Server Port
PORT=3001

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:8080
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 3: Configurar Frontend

Adicione ao arquivo `.env` na raiz do projeto:

```env
# API Backend URL
VITE_API_URL=http://localhost:3001
```

### Passo 4: Iniciar Backend

```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Conectado ao banco de dados Neon
✅ Conexão com Neon testada com sucesso
🚀 Servidor rodando em http://localhost:3001
```

### Passo 5: Iniciar Frontend (em outro terminal)

```bash
npm run dev
```

## 🧪 Testar

1. **Acesse**: http://localhost:8080
2. **Clique em "Cadastro"**
3. **Crie uma conta** de teste
4. **Faça login**
5. **Teste criar uma ordem de serviço**

## ✅ Checklist

- [ ] Backend instalado (`cd backend && npm install`)
- [ ] Arquivo `backend/.env` criado
- [ ] `JWT_SECRET` configurado
- [ ] `DATABASE_URL` configurado
- [ ] Frontend `.env` configurado com `VITE_API_URL`
- [ ] Backend rodando (`npm run dev` no diretório backend)
- [ ] Frontend rodando (`npm run dev` na raiz)
- [ ] Testado cadastro de usuário
- [ ] Testado login
- [ ] Testado criação de ordem de serviço

## 🐛 Problemas Comuns

### Erro: "DATABASE_URL não está configurada"
- Verifique se o arquivo `backend/.env` existe
- Verifique se a connection string está correta

### Erro: "Cannot connect to database"
- Verifique se a connection string do Neon está correta
- Verifique se o banco Neon está acessível
- Verifique se o SSL está configurado

### Erro: "CORS policy"
- Verifique se `FRONTEND_URL` está configurado no `.env` do backend
- Verifique se o frontend está rodando na URL configurada

### Erro: "Failed to fetch" no frontend
- Verifique se o backend está rodando
- Verifique se `VITE_API_URL` está configurado no frontend
- Verifique o console do navegador para mais detalhes

## 📚 Próximos Passos

Após instalar e configurar:

1. ✅ Backend rodando
2. ✅ Frontend conectado à API
3. ⏳ Testar todas as funcionalidades
4. ⏳ Adaptar outros componentes (Dashboard, ServiceOrders, etc.)

---

**🚀 Após instalar, me informe se está funcionando ou se há algum erro!**

