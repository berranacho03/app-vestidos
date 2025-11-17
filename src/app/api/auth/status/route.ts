import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecretKey';

export async function GET() {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('user_token') || cookieStore.get('admin_token');
    if (!tokenCookie) return NextResponse.json({ isLoggedIn: false });

    const token = tokenCookie.value;
    jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ isLoggedIn: true });
  } catch (err) {
    return NextResponse.json({ isLoggedIn: false });
  }
}
