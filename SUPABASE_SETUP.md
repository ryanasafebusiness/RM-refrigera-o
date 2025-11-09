# Configuração do Supabase

## Problema Atual
O erro "new row violates row-level security policy" indica que as políticas RLS (Row-Level Security) do Supabase estão bloqueando a inserção de dados.

## Soluções

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

### 2. Aplicar Migrações
Execute as migrações para corrigir as políticas RLS:

```bash
# Se usando Supabase local
npx supabase db reset

# Se usando Supabase em produção, aplique as migrações manualmente
```

### 3. Verificar Políticas RLS
No painel do Supabase, vá em Authentication > Policies e verifique se as políticas estão corretas:

- **service_orders**: Permitir INSERT para usuários autenticados
- **order_photos**: Permitir INSERT para usuários autenticados
- **order_parts_used**: Permitir INSERT para usuários autenticados
- **order_parts_replaced**: Permitir INSERT para usuários autenticados
- **order_signatures**: Permitir INSERT para usuários autenticados

### 4. Políticas Temporárias (Para Teste)
Se quiser testar rapidamente, pode temporariamente desabilitar RLS:

```sql
-- CUIDADO: Isso remove a segurança. Use apenas para teste!
ALTER TABLE public.service_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_parts_used DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_parts_replaced DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_signatures DISABLE ROW LEVEL SECURITY;
```

### 5. Verificar Autenticação
Certifique-se de que:
- O usuário está logado
- O `technician_id` está sendo passado corretamente
- O token de autenticação é válido

## Debug
Abra o console do navegador para ver os logs de debug que foram adicionados ao código.
