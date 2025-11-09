// Lucia Auth Configuration for Neon PostgreSQL
import { lucia } from "lucia";
import { pg } from "@lucia-auth/adapter-postgresql";
import { pool } from "./db";

// Importar pool do banco de dados
// O pool será configurado para usar a connection string do Neon

export const auth = lucia({
  adapter: pg(pool, {
    user: "user",
    session: "user_session",
    key: "user_key",
  }),
  env: import.meta.env.DEV ? "DEV" : "PROD",
  sessionCookie: {
    expires: false, // Sessão expira quando o navegador fecha
  },
  getUserAttributes: (data) => {
    return {
      email: data.email,
      name: data.name,
      phone: data.phone,
    };
  },
});

export type Auth = typeof auth;

