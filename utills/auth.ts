import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  role: string;
}

// ฟังก์ชันสำหรับสร้าง JWT
export function signToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn }) as string;
}

// ฟังก์ชันสำหรับตรวจสอบ JWT
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Type Narrowing เพื่อตรวจสอบว่า decoded เป็น TokenPayload หรือไม่
    if (decoded && typeof decoded === 'object' && 'id' in decoded && 'role' in decoded) {
      return decoded as TokenPayload;  // ทำการ Cast เป็น TokenPayload
    }
    // ถ้าไม่ตรงกับเงื่อนไขที่คาดหวัง
    throw new Error('Invalid token payload');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// ฟังก์ชันตรวจสอบว่า user เป็น admin หรือไม่
export function isAdmin(user: IUser | TokenPayload) {
  return user.role === 'admin';
}

// ฟังก์ชันตรวจสอบว่า user เป็น user หรือไม่
export function isUser(user: IUser | TokenPayload) {
  return user.role === 'user';
}