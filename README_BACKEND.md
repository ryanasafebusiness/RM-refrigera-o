# Backend API - RM Refrigeração

## Rotas Implementadas

### Autenticação (`/api/auth`)
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual (protegido)

### Clientes (`/api/clients`)
- `GET /api/clients` - Listar todos os clientes (protegido)
- `GET /api/clients/:id` - Obter cliente específico (protegido)
- `POST /api/clients` - Criar cliente (protegido)
- `PUT /api/clients/:id` - Atualizar cliente (protegido)
- `DELETE /api/clients/:id` - Deletar cliente (protegido)

### Ordens de Serviço (`/api/service-orders`)
- `GET /api/service-orders` - Listar todas as ordens do usuário (protegido)
- `GET /api/service-orders/:id` - Obter ordem específica (protegido)
- `POST /api/service-orders` - Criar ordem (protegido)
- `PUT /api/service-orders/:id` - Atualizar ordem (protegido)
- `DELETE /api/service-orders/:id` - Deletar ordem (protegido)

### Fotos/Vídeos (`/api/service-orders/:id/photos`)
- `GET /api/service-orders/:id/photos` - Listar fotos da ordem (protegido)
- `POST /api/service-orders/:id/photos` - Adicionar foto/vídeo (protegido)
  - Aceita JSON: `{ photo_url, photo_type, media_type, duration_seconds }`
  - Aceita FormData: `file`, `photoType`, `mediaType`, `durationSeconds`
- `DELETE /api/service-orders/:id/photos/:photoId` - Deletar foto (protegido)

### Peças Substituídas (`/api/service-orders/:id/parts`)
- `GET /api/service-orders/:id/parts` - Listar peças da ordem (protegido)
- `POST /api/service-orders/:id/parts` - Adicionar peça (protegido)
  - Body: `{ old_part, new_part, part_value }`
- `DELETE /api/service-orders/:id/parts/:partId` - Deletar peça (protegido)

### Assinaturas (`/api/service-orders/:id/signature`)
- `GET /api/service-orders/:id/signature` - Obter assinatura da ordem (protegido)
- `POST /api/service-orders/:id/signature` - Criar ou atualizar assinatura (protegido)
  - Body: `{ signature_data }`
- `PUT /api/service-orders/:id/signature` - Atualizar assinatura (protegido)
  - Body: `{ signature_data }`

## Migrações Necessárias

Execute a migração `003_add_missing_fields.sql` para adicionar campos faltantes:
- `clients`: city, state, zip_code, notes, created_by
- `order_parts_replaced`: part_value
- `service_orders`: total_value

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://...
JWT_SECRET=seu_secret_aqui
PORT=3001
FRONTEND_URL=http://localhost:8080
```

## Iniciar o Servidor

```bash
cd backend
npm install
npm run dev  # Desenvolvimento com watch
npm start   # Produção
```

## Notas

- Todas as rotas (exceto `/api/auth/signup` e `/api/auth/login`) requerem autenticação via JWT
- O token deve ser enviado no header: `Authorization: Bearer <token>`
- Upload de arquivos atualmente aceita URL ou FormData (para produção, considere usar S3/Cloudinary)
