# 🚀 Backend API - RM Refrigeração

## ✅ Backend Criado com Sucesso!

A API backend foi criada usando Express.js + JWT + Neon PostgreSQL.

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Conexão com Neon
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── routes/
│   │   ├── auth.js            # Login, Signup, Me
│   │   └── serviceOrders.js   # CRUD de ordens
│   └── server.js              # Servidor Express
├── package.json
└── .env.example
```

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar `.env`

Crie `backend/.env`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=gerar-uma-chave-secreta-aleatoria-aqui
PORT=3001
FRONTEND_URL=http://localhost:8080
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Iniciar Backend

```bash
npm run dev
```

### 4. Configurar Frontend

Adicione ao `.env` do frontend (raiz do projeto):

```env
VITE_API_URL=http://localhost:3001
```

### 5. Iniciar Frontend

```bash
npm run dev
```

## 📚 Endpoints

### Autenticação
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual

### Service Orders
- `GET /api/service-orders` - Listar ordens
- `GET /api/service-orders/:id` - Obter ordem
- `POST /api/service-orders` - Criar ordem
- `PUT /api/service-orders/:id` - Atualizar ordem
- `DELETE /api/service-orders/:id` - Deletar ordem

## 🔐 Autenticação

Todos os endpoints de service orders requerem o header:
```
Authorization: Bearer <token>
```

O token é obtido ao fazer login/signup e é armazenado no `localStorage`.

## ✅ Status

- ✅ Backend criado
- ✅ Autenticação JWT implementada
- ✅ Endpoints de service orders criados
- ✅ Frontend adaptado para usar API
- ⏳ Testar backend
- ⏳ Testar integração frontend-backend

---

**Próximo passo**: Instalar dependências do backend e testar!

