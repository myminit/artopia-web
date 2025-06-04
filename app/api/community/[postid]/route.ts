// File: app/api/community/[postid]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';

export async function GET(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const postid = pathname.split('/').pop();

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    await connectDB();
    const post = await CommunityPost.findById(postid).lean();
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
