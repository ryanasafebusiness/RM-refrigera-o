// Database configuration for Neon PostgreSQL
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada nas variáveis de ambiente');
}

// Create connection pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon requires SSL
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados Neon');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco de dados:', err);
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexão com Neon testada com sucesso'))
  .catch((err) => console.error('❌ Erro ao testar conexão:', err));

