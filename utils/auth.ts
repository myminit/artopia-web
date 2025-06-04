// /utils/auth.ts

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
}

// ── 1. ฟังก์ชันสร้าง JWT ───────────────────────────────────────────────
export function signToken(
  payload: TokenPayload,
  expiresIn: string = '7d'
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// ── 2. ฟังก์ชันตรวจสอบ JWT ───────────────────────────────────────────────
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// ── 3. ฟังก์ชันดึง token จาก request ────────────────────────────────────────
export function getTokenFromReq(req: NextRequest): string | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  return token;
}

// ── 4. ฟังก์ชันดึง user จาก request ────────────────────────────────────────
export async function getUserFromReq(req: NextRequest): Promise<TokenPayload | null> {
  try {
    const token = getTokenFromReq(req);
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// ── 5. ฟังก์ชันตรวจสอบ role (ถ้ามี) ────────────────────────────────────────
export function isAdmin(user: TokenPayload) {
  return user.role === 'admin';
}

export function isUser(user: TokenPayload) {
  return user.role === 'user';
}

export interface Session {
  user: TokenPayload;
}

export async function getSession(req: NextRequest): Promise<Session | null> {
  try {
    const token = getTokenFromReq(req);
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;
    
    return { user: decoded };
  } catch (error) {
    return null;
  }
}
