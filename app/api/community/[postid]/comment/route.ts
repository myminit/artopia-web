// File: app/api/community/[postid]/comment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import User from '@/models/User';
import { verifyToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];  // ['', 'api', 'community', 'postid', 'comment']

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    await connectDB();

    // ตรวจสอบ token & ดึง userId
    const token = request.cookies.get("token")?.value || "";
    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    
    // รองรับทั้ง id และ _id (ช่วงเปลี่ยนผ่าน)
    const userId = payload?._id || payload?.id;
    
    if (!payload || !userId) {
      console.error('Invalid token payload:', payload);
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Invalid or missing user ID in token'
      }, { status: 401 });
    }

    // อ่าน body → { text: string }
    const body = await request.json();
    const textRaw = typeof body.text === 'string' ? body.text.trim() : '';
    if (!textRaw) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // หาโพสต์
    console.log('Finding post with ID:', postid);
    const post = await CommunityPost.findById(postid).exec();
    if (!post) {
      console.error('Post not found with ID:', postid);
      return NextResponse.json({ 
        error: 'Post not found',
        details: `No post found with ID: ${postid}`
      }, { status: 404 });
    }
    console.log('Found post:', post._id);

    // หา userName จาก DB
    console.log('Finding user with ID:', userId);
    const user = await User.findById(userId).exec();
    if (!user) {
      console.error('User not found with ID:', userId);
      return NextResponse.json({ 
        error: 'User not found',
        details: `No user found with ID: ${userId}`
      }, { status: 404 });
    }
    console.log('Found user:', user._id);

    // สร้าง object comment (level-1)
    const commentObj = {
      _id: new Date().getTime().toString(),
      userId: user._id.toString(), // แปลงเป็น string เพื่อความแน่นอน
      userName: user.name,
      text: textRaw,
      createdAt: new Date(),
      likes: [],
      reports: [],
      replies: []
    };

    // push ลงใน post.comments แล้วบันทึก
    post.comments.push(commentObj);
    await post.save();

    // ตอบกลับ comment object พร้อม status 201
    return NextResponse.json(commentObj, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/community/[postid]/comment:', err);
    if (err instanceof mongoose.Error.CastError) {
      return NextResponse.json({ 
        error: 'Invalid ID format',
        details: err.message
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
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
    console.log('Finding post with ID:', postid);
    const post = await CommunityPost.findById(postid).exec();
    if (!post) {
      console.error('Post not found with ID:', postid);
      return NextResponse.json({ 
        error: 'Post not found',
        details: `No post found with ID: ${postid}`
      }, { status: 404 });
    }
    return NextResponse.json({ comments: post.comments || [] }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]/comment:', err);
    if (err instanceof mongoose.Error.CastError) {
      return NextResponse.json({ 
        error: 'Invalid ID format',
        details: err.message
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
