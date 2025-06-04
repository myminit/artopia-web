import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Report from "@/models/Report";
import { getUserFromReq } from "@/utils/auth";

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

    // 3) Find reports where this user is reported (reportUserId)
    const reports = await Report.find({ reportUserId: params.id })
      .populate('byUserId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error in GET /api/admin/user/[id]/reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 