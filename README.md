# 🏢 RM Refrigeração - Sistema de Ordens de Serviço

Sistema completo de gestão de ordens de serviço desenvolvido especificamente para a RM Refrigeração, com funcionalidades avançadas para técnicos e gestão de serviços.

## ✨ Funcionalidades Principais

### 🔧 Gestão de Ordens de Serviço
- **Criação de OS** - Formulário completo com validações
- **Status em Tempo Real** - Pendente, Em Andamento, Concluída, Cancelada
- **Técnico Responsável** - Atribuição e visualização do técnico
- **Exclusão Segura** - Confirmação obrigatória para exclusão

### 👨‍🔧 Gestão de Técnicos
- **Perfil Completo** - Nome, telefone, especialização
- **Histórico de OS** - Todas as ordens do técnico
- **Estatísticas** - Performance e satisfação do cliente

### 🔩 Controle de Peças
- **Peças Utilizadas** - Nome, quantidade, custo
- **Peças Substituídas** - Peça antiga → Peça nova
- **Fornecedores** - Rastreamento de origem das peças
- **Custos** - Cálculo automático de custos

### 📸 Mídia e Documentação
- **Fotos e Vídeos** - Upload de evidências do problema e solução
- **Assinatura Digital** - Assinatura do cliente na OS
- **Observações** - Notas internas e descrições detalhadas

### 📊 Relatórios Completos
- **Relatório Detalhado** - Todas as informações da OS
- **Exportação PDF** - Geração de relatório para impressão
- **Impressão Direta** - Layout otimizado para impressão
- **Dados do Técnico** - Informações do responsável

### 🌙 Interface Moderna
- **Modo Escuro/Claro** - Toggle automático
- **Design Responsivo** - Funciona em todos os dispositivos
- **Componentes Modernos** - UI/UX profissional
- **Navegação Intuitiva** - Interface amigável

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Express.js + JWT + Neon PostgreSQL
- **Database**: Neon PostgreSQL (gratuito)
- **State Management**: React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner

## 📦 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/ryanasafebusiness/RM-refrigera-o.git
cd RM-refrigera-o
```

### 2. Instale as Dependências

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 3. Configure as Variáveis de Ambiente

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=sua-chave-secreta-aqui
PORT=3001
FRONTEND_URL=http://localhost:8080
```

#### Frontend (`.env` na raiz)
```env
VITE_API_URL=http://localhost:3001
```

### 4. Execute as Migrações no Neon

1. Acesse: https://console.neon.tech
2. Abra seu projeto
3. Clique em "SQL Editor"
4. Execute as migrações em `supabase/migrations_neon/` na ordem

### 5. Inicie o Sistema

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

#### Terminal 2: Frontend
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **users** - Usuários do sistema
- **profiles** - Perfis dos técnicos
- **service_orders** - Ordens de serviço
- **order_photos** - Fotos e vídeos
- **order_parts_used** - Peças utilizadas
- **order_parts_replaced** - Peças substituídas
- **order_signatures** - Assinaturas digitais
- **clients** - Clientes

## 📱 Como Usar

### 1. Acesso ao Sistema
- Acesse `http://localhost:8080`
- Faça login ou crie uma conta
- Configure seu perfil de técnico

### 2. Criar Nova OS
- Clique em "Nova Ordem de Serviço"
- Preencha os dados do cliente
- Descreva o problema
- Salve a OS

### 3. Gerenciar OS Existente
- Acesse uma OS da lista
- Adicione fotos/vídeos do problema
- Descreva o serviço realizado
- Registre peças utilizadas/substituídas
- Colete assinatura do cliente
- Atualize o status

### 4. Gerar Relatório
- Clique em "Gerar Relatório Completo"
- Visualize todas as informações
- Imprima ou baixe como PDF

## 🔧 Funcionalidades Avançadas

### Modo Escuro
- Toggle automático no header
- Persistência da preferência
- Transições suaves

### Gestão de Peças
- Interface intuitiva para adicionar/remover
- Validações de campos obrigatórios
- Cálculo automático de custos

### Upload de Mídia
- Suporte a fotos e vídeos
- Compressão automática
- Organização por tipo (problema/solução)

### Relatórios
- Layout profissional
- Dados completos da OS
- Informações do técnico
- Lista detalhada de peças

## 🛡️ Segurança

- **Autenticação** - Login seguro com JWT tokens
- **Backend API** - Todas as operações protegidas
- **Validação** - Validação de dados no frontend e backend
- **Confirmação** - Diálogos de confirmação para ações críticas

## 🌐 Hospedagem

### Frontend
- **Vercel**: https://rmrefrgeracaocom.vercel.app
- Deploy automático via GitHub

### Backend
- Pode ser hospedado em:
  - Railway
  - Render
  - Fly.io
  - Vercel (serverless functions)
  - Qualquer serviço Node.js

### Database
- **Neon PostgreSQL**: Gratuito (0.5GB)
- Sem limite de tempo
- Backups automáticos

## 📈 Melhorias Futuras

- [ ] Dashboard com estatísticas
- [ ] Notificações push
- [ ] Integração com WhatsApp
- [ ] Sistema de agendamento
- [ ] Relatórios avançados
- [ ] API para integrações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para RM Refrigeração**

## 🔄 Changelog

Veja [CHANGELOG.md](./CHANGELOG.md) para histórico de mudanças.

## 📚 Documentação

- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Configuração do backend
- [INSTALAR_BACKEND.md](./INSTALAR_BACKEND.md) - Guia de instalação
- [EXECUTAR_MIGRACOES_NEON.md](./EXECUTAR_MIGRACOES_NEON.md) - Como executar migrações
