// /app/api/admin/user/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from "@/models/User";
import { getUserFromReq } from "@/utils/auth";

// GET /api/admin/user/[id] - Get user details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1) Check admin authorization
    const userPayload = await getUserFromReq(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized (no token)' }, { status: 401 });
    }
    if (userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden (not admin)' }, { status: 403 });
    }

    // 2) Connect to MongoDB
    await connectDB();

    // 3) Find user by ID
    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in GET /api/admin/user/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/user/[id] - Update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1) Check admin authorization
    const userPayload = await getUserFromReq(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized (no token)' }, { status: 401 });
    }
    if (userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden (not admin)' }, { status: 403 });
    }

    // 2) Connect to MongoDB
    await connectDB();

    // 3) Get update data from request body
    const data = await req.json();
    
    // 4) Update user
    const user = await User.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in PUT /api/admin/user/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/user/[id] - Delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1) Check admin authorization
    const userPayload = await getUserFromReq(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized (no token)' }, { status: 401 });
    }
    if (userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden (not admin)' }, { status: 403 });
    }

    // 2) Connect to MongoDB
    await connectDB();

    // 3) Delete user
    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/user/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}