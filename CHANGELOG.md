# 📝 Changelog - RM Refrigeração

## [2025-11-09] - Migração para Neon PostgreSQL + Backend API

### ✅ Adicionado

- **Backend API** (Express.js + JWT + Neon PostgreSQL)
  - Endpoints de autenticação (login, signup, me)
  - Endpoints de service orders (CRUD completo)
  - Middleware de autenticação JWT
  - Conexão com Neon PostgreSQL

- **Frontend Adaptado**
  - API Client (`src/lib/api-client.ts`)
  - Auth.tsx adaptado para usar API backend
  - ProtectedRoute.tsx adaptado para usar JWT
  - Index.tsx adaptado para usar API

- **Migrações para Neon**
  - Migrações adaptadas para Neon PostgreSQL
  - Tabelas criadas sem dependências do Supabase Auth
  - Schema completo do banco de dados

- **Documentação**
  - BACKEND_SETUP.md
  - INSTALAR_BACKEND.md
  - QUICK_START_BACKEND.md
  - EXECUTAR_MIGRACOES_NEON.md
  - E outros guias de configuração

### 🔄 Modificado

- **App.tsx**: Removido StackProvider (não necessário com backend API)
- **Auth.tsx**: Adaptado para usar API backend em vez de Supabase
- **ProtectedRoute.tsx**: Adaptado para usar JWT tokens
- **Index.tsx**: Adaptado para verificar autenticação via API

### 🗄️ Banco de Dados

- Migrado de Supabase para Neon PostgreSQL
- Tabelas adaptadas para funcionar sem Supabase Auth
- Estrutura mantida compatível

### 🔐 Autenticação

- Migrado de Supabase Auth para JWT tokens
- Backend gerencia autenticação
- Tokens armazenados no localStorage

### 📚 Arquivos Novos

- `backend/` - Estrutura completa do backend
- `src/lib/api-client.ts` - Cliente API
- `supabase/migrations_neon/` - Migrações adaptadas
- Vários arquivos de documentação

---

## Próximas Melhorias

- [ ] Adaptar Dashboard.tsx para usar API
- [ ] Adaptar ServiceOrders.tsx para usar API
- [ ] Adaptar ServiceOrder.tsx para usar API
- [ ] Adaptar ServiceOrderDetails.tsx para usar API
- [ ] Adaptar Clients.tsx para usar API
- [ ] Implementar upload de fotos
- [ ] Implementar assinaturas digitais
- [ ] Implementar gestão de peças

---

**Desenvolvido com ❤️ para RM Refrigeração**

