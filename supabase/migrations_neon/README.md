# Migrações Adaptadas para Neon

Estas migrações foram adaptadas para funcionar no Neon sem dependências do Supabase Auth.

## ⚠️ Diferenças das Migrações Originais

1. **Tabela de Usuários Própria**: Cria `public.users` em vez de usar `auth.users`
2. **Sem RLS**: Removidas políticas RLS (podem ser implementadas depois)
3. **Sem Storage**: Removidas referências ao `storage.buckets` do Supabase
4. **Sem Triggers de Auth**: Removidos triggers que dependem do Supabase Auth

## 📋 Como Executar

### 1. No SQL Editor do Neon

1. Acesse: https://console.neon.tech
2. Abra seu projeto
3. Clique em "SQL Editor"
4. Execute as migrações na ordem:
   - `001_create_tables_neon.sql`
   - `002_create_clients_table.sql`
   - `003_add_pricing.sql`

### 2. Verificar Execução

Após executar, verifique se as tabelas foram criadas:

```sql
-- Listar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

## 🔐 Autenticação

**IMPORTANTE**: Estas migrações criam a estrutura do banco, mas **não implementam autenticação**.

Para autenticação, você precisa:

1. **Opção A**: Usar Supabase Local (recomendado)
   - Instalar Docker + Supabase CLI
   - Rodar `supabase start`
   - Usar apenas para auth, banco fica no Neon

2. **Opção B**: Implementar Auth Próprio
   - Criar API backend
   - Implementar login/signup com JWT
   - Adaptar frontend

3. **Opção C**: Usar Neon Auth
   - Habilitar Neon Auth no projeto
   - Adaptar código para usar API do Neon Auth

## 📝 Próximos Passos

Após executar as migrações:

1. ✅ Tabelas criadas no Neon
2. ⏳ Configurar autenticação
3. ⏳ Adaptar código do frontend (se necessário)
4. ⏳ Testar sistema

## 🆘 Problemas

Se encontrar erros:

1. Verifique se a extensão `uuid-ossp` está disponível
2. Verifique se já existem tabelas (pode dar erro de "already exists")
3. Execute as migrações na ordem correta

---

**Nota**: Estas migrações são uma versão simplificada. Para produção, você precisará implementar segurança (RLS, autenticação, etc.).

