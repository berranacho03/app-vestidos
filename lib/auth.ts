import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

export function getTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('admin_token')?.value || null;
}

export function isAuthenticated(): boolean {
  const token = getTokenFromCookies();
  return token ? verifyToken(token) : false;
}

// Middleware para proteger rutas
export async function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }
}