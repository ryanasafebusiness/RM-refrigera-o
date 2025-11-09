# Script para criar arquivos .env

# Criar .env do backend
$backendEnv = @"
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=2f8556041fa92d2304a723cf7428eaad5a4abcdcc4b929e18218edf0977817b7
PORT=3001
FRONTEND_URL=http://localhost:8080
"@

$backendEnv | Out-File -FilePath "backend\.env" -Encoding utf8 -NoNewline
Write-Host "✅ Arquivo backend\.env criado"

# Criar .env do frontend
$frontendEnv = @"
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_XjhkBC0QfLK9@ep-frosty-smoke-acmkrq4f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# API Backend URL
VITE_API_URL=http://localhost:3001
"@

$frontendEnv | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "✅ Arquivo .env criado na raiz do projeto"

Write-Host "`n✅ Arquivos .env criados com sucesso!"
Write-Host "🚀 Agora você pode iniciar o backend e o frontend"

