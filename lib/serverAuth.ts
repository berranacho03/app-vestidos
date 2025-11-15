// Server-only authentication utilities
// These functions should only be imported and used directly in Server Components

import { 
  isUserAuthenticated, 
  getCurrentUser, 
  isAdminAuthenticated, 
  requireAdminAuth, 
  requireUserAuth,
  getFullUserInfo,
  UserPayload,
  FullUserInfo
} from './userAuth';

// Helper function to create nookies-compatible context from next/headers
// This is only safe to call in Server Components
async function getServerContext() {
  // Dynamically import next/headers to avoid build-time issues
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  const cookieObject = Object.fromEntries(
    cookieStore.getAll().map(cookie => [cookie.name, cookie.value])
  );
  
  // Debug: log cookies to see what we have
  console.log('Server cookies:', cookieObject);
  
  return { req: { cookies: cookieObject } };
}

export async function isUserAuthenticatedServer(): Promise<boolean> {
  const ctx = await getServerContext();
  return isUserAuthenticated(ctx);
}

export async function getCurrentUserServer(): Promise<UserPayload | null> {
  const ctx = await getServerContext();
  return getCurrentUser(ctx);
}

export async function isAdminAuthenticatedServer(): Promise<boolean> {
  const ctx = await getServerContext();
  return isAdminAuthenticated(ctx);
}

export async function requireAdminAuthServer() {
  const ctx = await getServerContext();
  return requireAdminAuth(ctx);
}

export async function requireUserAuthServer(): Promise<UserPayload> {
  const ctx = await getServerContext();
  return requireUserAuth(ctx);
}

export async function getFullUserInfoServer(): Promise<FullUserInfo | null> {
  const ctx = await getServerContext();
  return getFullUserInfo(ctx);
}

// Legacy auth.ts compatibility functions
export async function isAuthenticatedServer(): Promise<boolean> {
  return isAdminAuthenticatedServer();
}

export async function requireAuthServer() {
  return requireAdminAuthServer();
}