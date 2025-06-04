// File: app/api/community/[postid]/comment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import User, { IUser } from '@/models/User';
import { getUserFromReq } from '@/utils/auth';

export async function POST(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];  // ['', 'api', 'community', 'postid', 'comment']

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    // 2. ตรวจสอบ token & ดึง userId
    const userPayload = await getUserFromReq(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = userPayload.id;

    // 3. อ่าน body → { text: string }
    const body = await request.json();
    const textRaw = typeof body.text === 'string' ? body.text.trim() : '';
    if (!textRaw) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // 4. ต่อ DB และหาโพสต์
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 5. หา userName จาก DB (fallback: userPayload.role หากหาไม่เจอ)
    let userName: string;
    try {
      const userDoc = (await User.findById(userId).lean()) as IUser | null;
      userName = userDoc?.name || userPayload.role;
    } catch (e) {
      console.error('Failed to fetch user from DB:', e);
      userName = userPayload.role;
    }

    // 6. สร้าง object comment (level-1)
    const commentObj = {
      _id:       new Date().getTime().toString(),
      userId:    userId,
      userName:  userName,
      text:      textRaw,
      createdAt: new Date(),
      likes:     [] as string[],
      reports:   [] as any[],
      replies:   [] as any[]
    };

    // 7. push ลงใน post.comments แล้วบันทึก
    post.comments.push(commentObj);
    await post.save();

    // 8. ตอบกลับ comment object พร้อม status 201
    return NextResponse.json(commentObj, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/community/[postid]/comment:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];  // ['', 'api', 'community', 'postid', 'comment']

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ comments: post.comments || [] }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]/comment:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
