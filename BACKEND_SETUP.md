# 🚀 Configuração do Backend API

## ✅ Estrutura Criada

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Configuração do banco Neon
│   ├── middleware/
│   │   └── auth.js            # Middleware de autenticação JWT
│   ├── routes/
│   │   ├── auth.js            # Rotas de autenticação
│   │   └── serviceOrders.js   # Rotas de ordens de serviço
│   └── server.js              # Servidor Express
├── package.json
└── .env.example
```

## 📋 Passo 1: Instalar Dependências do Backend

```bash
cd backend
npm install
```

## 📋 Passo 2: Configurar Variáveis de Ambiente

Crie o arquivo `backend/.env`:

```env
# Neon Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (gere uma chave secreta)
JWT_SECRET=your-secret-key-change-this-in-production-min-32-characters

# Server Port
PORT=3001

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:8080
```

**Para gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Passo 3: Configurar Frontend

Adicione ao arquivo `.env` do frontend (raiz do projeto):

```env
# API Backend URL
VITE_API_URL=http://localhost:3001
```

## 📋 Passo 4: Iniciar Backend

```bash
cd backend
npm run dev
```

O servidor irá rodar em `http://localhost:3001`

## 📋 Passo 5: Iniciar Frontend

```bash
npm run dev
```

O frontend irá rodar em `http://localhost:8080`

## 🧪 Testar API

### Health Check
```bash
curl http://localhost:3001/health
```

### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 📚 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual (protegido)

### Service Orders
- `GET /api/service-orders` - Listar todas as ordens (protegido)
- `GET /api/service-orders/:id` - Obter ordem específica (protegido)
- `POST /api/service-orders` - Criar ordem (protegido)
- `PUT /api/service-orders/:id` - Atualizar ordem (protegido)
- `DELETE /api/service-orders/:id` - Deletar ordem (protegido)

## 🔐 Autenticação

Todos os endpoints de service orders requerem autenticação via JWT token.

**Header necessário:**
```
Authorization: Bearer <token>
```

O token é obtido ao fazer login ou signup e é armazenado no `localStorage` do frontend.

## 🐛 Problemas Comuns

### Erro: "DATABASE_URL não está configurada"
- Verifique se o arquivo `backend/.env` existe
- Verifique se a connection string está correta

### Erro: "Cannot connect to database"
- Verifique se a connection string do Neon está correta
- Verifique se o banco Neon está acessível
- Verifique se o SSL está configurado corretamente

### Erro: "CORS policy"
- Verifique se `FRONTEND_URL` está configurado no `.env` do backend
- Verifique se o frontend está rodando na URL configurada

### Erro: "Token inválido"
- Verifique se o token está sendo enviado no header
- Verifique se o `JWT_SECRET` está configurado corretamente
- Faça login novamente para obter um novo token

## ✅ Próximos Passos

1. ✅ Backend criado
2. ⏳ Instalar dependências do backend
3. ⏳ Configurar `.env` do backend
4. ⏳ Configurar `.env` do frontend
5. ⏳ Adaptar frontend para usar API
6. ⏳ Testar autenticação
7. ⏳ Testar CRUD de service orders

---

**Após instalar as dependências e configurar o `.env`, me informe para continuar com a adaptação do frontend!**

