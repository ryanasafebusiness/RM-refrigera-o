# 💰 Sistema de Valores - Setup

## ✅ O que foi implementado

Sistema completo de controle de valores para ordens de serviço:

### 🎯 Funcionalidades

1. **Valor Individual das Peças**
   - Campo para inserir valor de cada peça substituída
   - Formato: Decimal (R$ 0.00)
   - Armazenado na tabela `order_parts_replaced`

2. **Valor Total Automático**
   - Cálculo automático da soma dos valores das peças
   - Atualizado automaticamente ao adicionar/remover peças
   - Exibido em destaque na interface

3. **Exibição**
   - Valores individuais nas peças substituídas
   - Valor total em card destacado
   - Formato brasileiro (R$ X.XX)

## 📊 Estrutura do Banco de Dados

### Migração SQL Criada

Arquivo: `supabase/migrations/20250127000000_add_pricing_to_orders.sql`

```sql
-- Add pricing fields to service orders
ALTER TABLE public.service_orders 
  ADD COLUMN IF NOT EXISTS total_value DECIMAL(10, 2) DEFAULT 0;

-- Add pricing fields to order_parts_replaced
ALTER TABLE public.order_parts_replaced 
  ADD COLUMN IF NOT EXISTS part_value DECIMAL(10, 2) DEFAULT 0;
```

## 🚀 Como aplicar a migração

### Opção 1: Via Supabase Dashboard

1. Acesse o Dashboard do Supabase
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `supabase/migrations/20250127000000_add_pricing_to_orders.sql`
4. Cole no editor e execute

### Opção 2: Via CLI

```bash
# No terminal, dentro da pasta do projeto
npx supabase migration up
```

## 📱 Como usar

### 1. Adicionar Peças com Valor

1. Na página de edição da OS, role até "Peças Substituídas"
2. Preencha:
   - **Peça antiga**: Nome da peça defeituosa
   - **Peça nova**: Nome da peça substituta
   - **Valor da peça**: Valor em R$ (ex: 350.50)
3. Clique em "Adicionar Substituição"
4. O valor é automaticamente adicionado ao total

### 2. Visualizar Valor Total

- O valor total é exibido automaticamente após as peças substituídas
- Atualizado em tempo real ao adicionar/remover peças
- Exibido em formato destacado: **R$ 1.250,00**

### 3. Remover Peça

- Ao remover uma peça, seu valor é automaticamente subtraído do total
- O valor total é atualizado instantaneamente

## 💡 Funcionamento

### Fluxo de Valores

1. **Adicionar Peça**
   - Inserir peça antiga e nova
   - Inserir valor (ex: 250.00)
   - Total = Total anterior + Valor da peça

2. **Remover Peça**
   - Clicar no X da peça
   - Total = Total anterior - Valor da peça removida

3. **Salvar OS**
   - Valor total é salvo automaticamente no banco
   - Persistente e recuperável

## 🎨 Interface

### Exibição de Valores

```
┌─────────────────────────────────┐
│ Peças Substituídas              │
├─────────────────────────────────┤
│ De: Radiador                     │
│ Para: Radiador Novo (Garantia)   │
│ Valor: R$ 350,00 ← Destacado    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💰 Valor Total                   │
├─────────────────────────────────┤
│ Total:          R$ 1.250,00      │
└─────────────────────────────────┘
```

### Design
- Valores em destaque (cor primária)
- Formato monetário brasileiro
- Card destacado para valor total
- Atualização em tempo real

## 📄 Relatórios

Os valores também aparecem nos relatórios:

1. **Relatório Visual**
   - Valores individuais de cada peça
   - Valor total em destaque
   - Pronto para impressão

2. **Relatório PDF**
   - Mesma formatação
   - Exportável para cliente
   - Profissional e completo

## 🔧 Detalhes Técnicos

### Campos de Banco

| Campo | Tipo | Tabela | Descrição |
|-------|------|--------|-----------|
| `total_value` | DECIMAL(10,2) | service_orders | Valor total da OS |
| `part_value` | DECIMAL(10,2) | order_parts_replaced | Valor da peça |

### Validações

- ✅ Valores aceitam decimais
- ✅ Formato: 0.00 a 99999999.99
- ✅ Aceita zero (para peças sem custo)
- ✅ Cálculo automático do total

### Comportamento

- ✅ Atualização em tempo real
- ✅ Soma automática
- ✅ Subtração automática ao remover
- ✅ Persistência no banco

## 🐛 Troubleshooting

### Erro: "column does not exist"

**Solução**: Execute a migração SQL (veja "Como aplicar a migração")

### Valor total não atualiza

**Solução**: 
1. Recarregue a página
2. Verifique se os valores das peças estão corretos
3. Confirme que a migração foi aplicada

### Valores não aparecem

**Solução**: 
1. Verifique se a migração foi aplicada
2. Limpe o cache do navegador
3. Faça logout e login novamente

## 📊 Exemplo de Uso

### Cenário: Trocas de Peças

1. **Peça 1**: Radiador antigo → Radiador novo
   - Valor: R$ 350,00
   - Total: R$ 350,00

2. **Peça 2**: Bobina queimada → Bobina nova
   - Valor: R$ 120,00
   - Total: R$ 470,00

3. **Peça 3**: Filtro antigo → Filtro novo
   - Valor: R$ 45,00
   - Total: R$ 515,00

**Resultado**: Valor total exibido e salvo como R$ 515,00

## ✅ Status

**Implementação**: ✅ Completa
**Build**: ✅ Sem erros
**Próximo Passo**: Aplicar migração SQL

---

**Nota**: Após aplicar a migração SQL, reinicie o servidor para garantir que as mudanças sejam carregadas.

