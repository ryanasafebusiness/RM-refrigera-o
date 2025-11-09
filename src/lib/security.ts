/**
 * Utilitários de segurança para o sistema
 */

/**
 * Sanitiza string para prevenir XSS
 */
export const sanitize = (str: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return str.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Valida e sanitiza nome de usuário
 */
export const sanitizeName = (name: string): string => {
  return sanitize(name)
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
    .substring(0, 100);
};

/**
 * Valida e sanitiza email
 */
export const sanitizeEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitize(email.trim());
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Email inválido');
  }
  
  return sanitized.toLowerCase();
};

/**
 * Valida URL para prevenir SSRF
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Permitir apenas HTTP e HTTPS
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitiza números
 */
export const sanitizeNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return null;
  }
  
  return num;
};

/**
 * Valida string para SQL Injection
 */
export const isValidSQLString = (str: string): boolean => {
  // Lista de padrões SQL perigosos
  const dangerousPatterns = [
    /('|(\\')|(--)|(\/\*)|(\*\/)|(\%27)|(\%23)|(\%2D)|(\%2D)|(\%2F)|(\%5C)|(\%2A))/i,
    /(ALTER|CREATE|DELETE|DROP|EXEC|EXECUTE|INSERT|SELECT|UNION|UPDATE)/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(str));
};

/**
 * Limpa dados de um objeto removendo caracteres perigosos
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitize(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Rate limiting simples baseado em localStorage
 */
export const checkRateLimit = (
  key: string, 
  maxAttempts: number, 
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } => {
  const now = Date.now();
  const attemptsKey = `rate_limit_${key}`;
  const resetKey = `rate_reset_${key}`;
  
  const attempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10);
  const resetAt = parseInt(localStorage.getItem(resetKey) || '0', 10);
  
  // Resetar se a janela expirou
  if (now > resetAt) {
    localStorage.setItem(attemptsKey, '1');
    localStorage.setItem(resetKey, String(now + windowMs));
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt: now + windowMs
    };
  }
  
  // Verificar limite
  if (attempts >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt
    };
  }
  
  // Incrementar tentativas
  localStorage.setItem(attemptsKey, String(attempts + 1));
  
  return {
    allowed: true,
    remaining: maxAttempts - attempts - 1,
    resetAt
  };
};

/**
 * Gera hash simples para CSRF token
 */
export const generateToken = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Valida token CSRF
 */
export const validateToken = (token: string, sessionToken: string): boolean => {
  if (!token || !sessionToken) {
    return false;
  }
  
  return token === sessionToken;
};
