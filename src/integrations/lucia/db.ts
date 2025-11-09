// Database connection pool for Neon PostgreSQL
import { Pool } from "pg";

const DATABASE_URL = import.meta.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL não está configurada nas variáveis de ambiente");
}

// Criar pool de conexões
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon requer SSL
  },
});

// Testar conexão
pool.on("connect", () => {
  console.log("✅ Conectado ao banco de dados Neon");
});

pool.on("error", (err) => {
  console.error("❌ Erro na conexão com o banco de dados:", err);
});

