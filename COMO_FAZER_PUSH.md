# 🚀 Como Fazer Push para o GitHub

## ⚠️ Autenticação Necessária

O Git precisa de autenticação para fazer push. Siga estes passos:

## 📝 Passo a Passo

### 1. Faça o push manualmente no terminal:

```bash
# Configure suas credenciais (se ainda não fez)
git config --global user.name "dutrafps"
git config --global user.email "seu-email@example.com"

# Adicione todos os arquivos
git add .

# Faça o commit
git commit -m "Sistema RM Refrigeração - Sistema de Ordens de Serviço completo"

# Faça o push (será solicitado usuário e senha)
git push -u origin main --force
```

### 2. Quando solicitado, use:
- **Username**: `dutrafps`
- **Password**: Seu **Personal Access Token** do GitHub (não sua senha)

### 3. Como criar um Personal Access Token:
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome ao token (ex: "RM Refrigeração")
4. Selecione as permissões: `repo` (completo)
5. Clique em "Generate token"
6. **Copie o token** (você só verá uma vez!)
7. Use este token como senha ao fazer push

## 🎯 Alternativa: Usar GitHub Desktop

1. Instale o [GitHub Desktop](https://desktop.github.com/)
2. Faça login com sua conta GitHub
3. Abra este repositório
4. Faça o commit e push através da interface

## ✅ Outra Alternativa: SSH

Se preferir usar SSH, configure suas chaves SSH:

```bash
# Configurar SSH
ssh-keygen -t eda25519 -C "seu-email@example.com"

# Adicionar a chave pública ao GitHub
# Copie o conteúdo de ~/.ssh/id_ed25519.pub
# E adicione em: https://github.com/settings/keys

# Mudar remote para SSH
git remote set-url origin git@github.com:dutrafps/RM-refrigera-o.git
git push -u origin main
```

## 📋 Status Atual

- ✅ Repositório inicializado
- ✅ Todos os arquivos adicionados
- ✅ Commit criado
- ⏳ Pendente: Push para GitHub (requer autenticação)
