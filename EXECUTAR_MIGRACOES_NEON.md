# 🚀 Executar Migrações no Neon

## 📋 Como Executar

### Opção 1: SQL Editor do Neon (Recomendado)

1. **Acesse o Dashboard do Neon**
   - Vá para: https://console.neon.tech
   - Abra seu projeto "Rm Refrigera"

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Ou use o atalho: https://console.neon.tech/app/[seu-projeto]/sql

3. **Execute as Migrações**

   ⚠️ **IMPORTANTE**: As migrações atuais dependem do Supabase Auth (`auth.users`, `auth.uid()`). 
   
   Você tem duas opções:

   #### Opção A: Executar Migrações Adaptadas (Sem Auth)
   
   Use as migrações adaptadas em `supabase/migrations_neon/` que removem dependências do Supabase.
   
   #### Opção B: Usar Supabase Local para Auth
   
   Instale Docker + Supabase local, depois execute as migrações originais.

### Opção 2: Via CLI (Futuro)

O neonctl não suporta execução de SQL diretamente. Você pode:
- Usar o SQL Editor (mais fácil)
- Ou instalar psql no Windows (mais complexo)

## 📝 Ordem de Execução das Migrações

Execute na seguinte ordem:

1. `20251024121909_dfb7a59a-fd0b-463f-894c-3a295e44f9f0.sql` (Tabelas principais)
2. `20251024122840_06e84c62-1281-4977-9c1d-3843c52053aa.sql` (Se houver)
3. `20250126000000_create_clients_table.sql` (Tabela de clientes)
4. `20250127000000_add_pricing_to_orders.sql` (Preços)
5. `20250125000000_fix_rls_policies.sql` (Políticas RLS)
6. `20250125000001_temporary_fix_rls.sql` (Correções RLS)
7. `20250125000002_fix_delete_policy.sql` (Política de delete)
8. `20250125000003_fix_signatures_policy.sql` (Assinaturas)
9. `20250125000004_fix_order_photos_rls.sql` (Fotos)

## ⚠️ Problema: Dependências do Supabase Auth

As migrações atuais usam:
- `auth.users` - Tabela de usuários do Supabase
- `auth.uid()` - Função para obter ID do usuário atual
- `storage.buckets` - Sistema de storage do Supabase

### Soluções:

#### Solução 1: Criar Tabela de Usuários Própria

Crie uma tabela `users` no Neon e adapte as migrações para usar essa tabela.

#### Solução 2: Usar Supabase Local

Instale Supabase local apenas para autenticação, mantendo o banco no Neon.

#### Solução 3: Desabilitar RLS Temporariamente

Execute as migrações sem RLS, depois implemente segurança no código.

## 🔧 Passo a Passo Detalhado

### 1. Acessar SQL Editor

1. Vá para: https://console.neon.tech
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral

### 2. Executar Primeira Migração

1. Abra o arquivo: `supabase/migrations/20251024121909_dfb7a59a-fd0b-463f-894c-3a295e44f9f0.sql`
2. Copie o conteúdo
3. Cole no SQL Editor do Neon
4. ⚠️ **ADAPTE** removendo referências a `auth.users` e `auth.uid()`
5. Clique em "Run" ou pressione Ctrl+Enter

### 3. Verificar Erros

Se houver erros:
- Verifique a mensagem de erro
- Adapte a migração conforme necessário
- Execute novamente

### 4. Continuar com Próximas Migrações

Repita o processo para cada migração na ordem.

## ✅ Verificar Execução

Após executar as migrações, verifique se as tabelas foram criadas:

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar estrutura de uma tabela
\d public.service_orders
```

## 🆘 Problemas Comuns

### Erro: "relation auth.users does not exist"
- **Solução**: Adapte a migração para não usar `auth.users`
- Ou instale Supabase local para auth

### Erro: "function auth.uid() does not exist"
- **Solução**: Remova ou adapte as políticas RLS que usam `auth.uid()`
- Ou crie uma função similar no Neon

### Erro: "relation storage.buckets does not exist"
- **Solução**: Remova as políticas de storage
- Ou implemente storage próprio

## 📚 Próximos Passos

Após executar as migrações:

1. ✅ Tabelas criadas no Neon
2. ⏳ Configurar autenticação (Supabase local ou outra)
3. ⏳ Testar conexão do aplicativo
4. ⏳ Verificar se tudo está funcionando

---

**Precisa de ajuda?** Me informe qual erro está encontrando e eu ajudo a resolver!

