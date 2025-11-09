# 📋 Cadastro de Clientes - Setup

## ✅ O que foi implementado

Sistema completo de gestão de clientes com as seguintes funcionalidades:

### 🎯 Funcionalidades

1. **Cadastro de Clientes**
   - Nome completo
   - E-mail
   - Telefone (obrigatório)
   - Endereço completo
   - Cidade
   - Estado
   - CEP
   - Observações

2. **Listagem**
   - Busca por nome, telefone ou e-mail
   - Exibição em cards responsivos
   - Grid adaptável (1 col mobile, 2 tablet, 3 desktop)

3. **Gestão**
   - Editar clientes existentes
   - Excluir clientes com confirmação
   - Visualização completa dos dados

## 📊 Estrutura do Banco de Dados

### Tabela: `clients`

```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
```

### Políticas RLS

- ✅ Usuários autenticados podem visualizar todos os clientes
- ✅ Usuários autenticados podem criar clientes
- ✅ Usuários autenticados podem editar clientes
- ✅ Usuários autenticados podem excluir clientes

## 🚀 Como aplicar a migração

### Opção 1: Via Supabase Dashboard

1. Acesse o Dashboard do Supabase
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `supabase/migrations/20250126000000_create_clients_table.sql`
4. Cole no editor e execute

### Opção 2: Via CLI

```bash
# No terminal, dentro da pasta do projeto
npx supabase migration up
```

## 📱 Como usar

### 1. Acessar o Cadastro de Clientes

- No Dashboard, clique no botão **"Clientes"** no header
- Ou acesse diretamente: `http://localhost:8080/clients`

### 2. Cadastrar Novo Cliente

1. Clique em **"Novo Cliente"**
2. Preencha os campos:
   - **Nome**: obrigatório
   - **Telefone**: obrigatório
   - **E-mail**: opcional
   - **Endereço**: opcional
   - **Cidade**: opcional
   - **Estado**: opcional (ex: SP)
   - **CEP**: opcional
   - **Observações**: opcional
3. Clique em **"Salvar"**

### 3. Buscar Clientes

- Use a barra de busca no topo
- Busca por: nome, telefone ou e-mail

### 4. Editar Cliente

1. Na lista de clientes, clique em **"Editar"**
2. Modifique os campos desejados
3. Clique em **"Salvar"**

### 4. Excluir Cliente

1. Na lista de clientes, clique em **"Excluir"**
2. Confirme a exclusão
3. O cliente será removido permanentemente

## 🎨 Interface

### Design Moderno
- Cards responsivos
- Badges coloridos
- Ícones intuitivos
- Modal de edição/cadastro
- Dialog de confirmação para exclusão

### Navegação
- Botão "Clientes" no header do Dashboard
- Retorno automático ao Dashboard
- Rota protegida (requer autenticação)

## 📝 Campos do Formulário

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome | Text | ✅ Sim | Nome completo do cliente |
| Telefone | Text | ✅ Sim | Telefone de contato |
| E-mail | Email | ❌ Não | E-mail do cliente |
| Endereço | Text | ❌ Não | Logradouro |
| Cidade | Text | ❌ Não | Cidade |
| Estado | Text | ❌ Não | UF (ex: SP) |
| CEP | Text | ❌ Não | Código postal |
| Observações | Textarea | ❌ Não | Notas adicionais |

## 🔐 Segurança

- ✅ Autenticação obrigatória
- ✅ RLS (Row Level Security) habilitado
- ✅ Políticas de acesso baseadas em autenticação
- ✅ Validação de dados no frontend
- ✅ Proteção contra SQL Injection (via Supabase)

## 📊 Integração Futura

O cadastro de clientes foi desenvolvido para futura integração com:
- Seleção de cliente ao criar OS
- Histórico de atendimentos
- Relatórios por cliente
- Estatísticas de clientes

## 🐛 Troubleshooting

### Erro: "relation clients does not exist"

**Solução**: Execute a migração SQL (veja "Como aplicar a migração")

### Erro: "new row violates row-level security policy"

**Solução**: Verifique se as políticas RLS estão criadas corretamente

### Cliente não aparece na lista

**Solução**: Verifique se está logado e se a migração foi aplicada corretamente

## 📞 Suporte

Para mais informações ou suporte, consulte a documentação do Supabase.

---

**Status**: ✅ Implementado e funcional
**Versão**: 1.0.0

