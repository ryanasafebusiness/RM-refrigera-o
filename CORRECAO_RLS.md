# 🔧 Correção do Erro RLS - Upload de Fotos/Vídeos

## ❌ Problema
Erro: `new row violates row-level security policy` ao tentar fazer upload de fotos/vídeos.

## ✅ Solução SIMPLES

### Passo 1: Executar SQL no Supabase Dashboard

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor**
3. Cole e execute o código do arquivo `supabase_simple_fix.sql`

### Passo 2: Verificar se funcionou

Após executar o SQL, teste o upload de fotos/vídeos no sistema.

## 📋 O que o SQL faz:

1. **Desabilita RLS** temporariamente na tabela `order_photos`
2. **Remove todas as políticas** antigas que estavam causando problemas
3. **Cria políticas simples** de storage para o bucket `order-photos`
4. **Permite uploads** para usuários autenticados

## 🔍 Verificação

Se ainda houver problemas, verifique:

1. **Autenticação**: Usuário está logado?
2. **Bucket**: Bucket `order-photos` existe?
3. **Colunas**: Tabela tem as colunas `media_type` e `duration_seconds`?

## ⚠️ Importante

Esta solução desabilita RLS na tabela `order_photos`. Para produção, considere:
- Reabilitar RLS após testes
- Criar políticas mais específicas
- Implementar controle de acesso adequado

## 🚀 Alternativa Segura (Futuro)

Quando estiver funcionando, você pode reabilitar RLS com políticas corretas:

```sql
-- Reabilitar RLS
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;

-- Criar política simples
CREATE POLICY "Authenticated users can manage photos"
  ON public.order_photos FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```
