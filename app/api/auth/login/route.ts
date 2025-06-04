import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/auth'

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  try {
    const user = await User.findOne({ email });
    console.log("login user from db:", user); // เพิ่มบรรทัดนี้
    if (!user) {
      return NextResponse.json({ message: 'Email not found' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    // ตรวจสอบ role ว่าเป็น admin หรือ user
    if (user.role !== "admin" && user.role !== "user") {
      return NextResponse.json({ message: 'Unauthorized role' }, { status: 403 });
    }

    const token = signToken({ 
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    console.log("login token payload:", { 
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    });
    console.log("LOGIN: token created =", token);

    const response = NextResponse.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong', error }, { status: 500 });
  }
}
