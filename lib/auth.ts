import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecretKey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AdminCredentials {
  username: string;
  password: string;
}

export function validateAdminCredentials(credentials: AdminCredentials): boolean {
  return (
    credentials.username === process.env.ADMIN_USERNAME &&
    credentials.password === process.env.ADMIN_PASSWORD
  );
}

export function generateToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function getTokenFromCookies(ctx?: any): string | null {
  let cookies;
  
  if (ctx && ctx.req && ctx.req.cookies) {
    // Si tenemos un contexto con cookies ya parseadas (como del servidor)
    cookies = ctx.req.cookies;
  } else {
    // Usar parseCookies para otros contextos
    cookies = parseCookies(ctx);
  }
  
  return cookies['admin_token'] || null;
}

export function isAuthenticated(ctx?: any): boolean {
  const token = getTokenFromCookies(ctx);
  return token ? verifyToken(token) : false;
}

// Middleware para proteger rutas
export async function requireAuth(ctx?: any) {
  if (!isAuthenticated(ctx)) {
    throw new Error('Unauthorized');
  }
}