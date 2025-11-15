import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecretKey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface UserPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

export interface FullUserInfo {
  id: number;
  email: string;
  name: string;
  phone: string;
}

// ===== FUNCIONES PARA ADMIN =====

export function validateAdminCredentials(credentials: AdminCredentials): boolean {
  return (
    credentials.username === process.env.ADMIN_USERNAME &&
    credentials.password === process.env.ADMIN_PASSWORD
  );
}

export function generateAdminToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function getAdminTokenFromCookies(ctx?: any): string | null {
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

export function isAdminAuthenticated(ctx?: any): boolean {
  const token = getAdminTokenFromCookies(ctx);
  return token ? verifyToken(token) : false;
}

export async function requireAdminAuth(ctx?: any) {
  if (!isAdminAuthenticated(ctx)) {
    throw new Error('Unauthorized');
  }
}

// ===== FUNCIONES PARA USUARIOS =====

export function getUserTokenFromCookies(ctx?: any): string | null {
  let cookies;
  
  if (ctx && ctx.req && ctx.req.cookies) {
    // Si tenemos un contexto con cookies ya parseadas (como del servidor)
    cookies = ctx.req.cookies;
  } else {
    // Usar parseCookies para otros contextos
    cookies = parseCookies(ctx);
  }
  
  console.log('Getting user token, available cookies:', Object.keys(cookies));
  console.log('user_token value:', cookies['user_token']);
  
  return cookies['user_token'] || null;
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function decodeUserToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function getCurrentUser(ctx?: any): UserPayload | null {
  const token = getUserTokenFromCookies(ctx);
  if (!token) return null;
  return decodeUserToken(token);
}

export function isUserAuthenticated(ctx?: any): boolean {
  const token = getUserTokenFromCookies(ctx);
  return token ? verifyToken(token) : false;
}

export async function requireUserAuth(ctx?: any): Promise<UserPayload> {
  const user = getCurrentUser(ctx);
  if (!user) {
    throw new Error('Unauthorized - User not authenticated');
  }
  return user;
}

export async function getFullUserInfo(ctx?: any): Promise<FullUserInfo | null> {
  const user = getCurrentUser(ctx);
  if (!user) return null;
  
  try {
    // Importar dinámicamente para evitar dependencias circulares
    const { query } = await import('./db');
    const rows = await query("SELECT id, email, name, phone FROM Users WHERE id = ?", [user.userId]);
    if (!rows || rows.length === 0) return null;
    
    const userRow = rows[0] as any;
    return {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      phone: userRow.phone || 'N/A'
    };
  } catch (error) {
    console.error('Error fetching full user info:', error);
    return null;
  }
}

// ===== FUNCIÓN LEGACY (mantener compatibilidad) =====

export function generateToken(): string {
  return generateAdminToken();
}

export function getTokenFromCookies(ctx?: any): string | null {
  return getAdminTokenFromCookies(ctx);
}

export function isAuthenticated(ctx?: any): boolean {
  return isAdminAuthenticated(ctx);
}

// Middleware para proteger rutas
export async function requireAuth(ctx?: any) {
  return requireAdminAuth(ctx);
}
