// File: app/api/community/[postid]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost, { ICommunityPost } from '@/models/CommunityPost';
import User, { IUser } from '@/models/User';
import mongoose from 'mongoose';

// Define interfaces locally to avoid import issues
interface IReport {
  _id: string;
  userId: string;
  reason: string;
  detail?: string;
  createdAt: Date;
}

interface IReply {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  likes: string[];
  reports: IReport[];
}

interface IComment {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  likes: string[];
  reports: IReport[];
  replies: IReply[];
}

interface CommentWithAvatar extends Omit<IComment, 'replies'> {
  userAvatar?: string;
  replies?: Array<{
    _id: string;
    userId: string;
    userName: string;
    text: string;
    userAvatar?: string;
  }>;
}

interface PostWithAvatar extends Omit<ICommunityPost, 'comments'> {
  userAvatar?: string;
  comments?: CommentWithAvatar[];
}

export async function GET(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const postid = pathname.split('/').pop();

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    await connectDB();
    const post = (await CommunityPost.findById(postid).lean()) as unknown as PostWithAvatar;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Fetch post author's avatar
    const postUser = (await User.findById(post.userId).select('avatar').lean()) as Pick<IUser, '_id' | 'avatar'>;
    if (postUser?.avatar) {
      post.userAvatar = postUser.avatar;
    }

    // Fetch avatars for all commenters
    const userIds = new Set<string>();
    post.comments?.forEach(comment => {
      if (comment.userId) userIds.add(comment.userId.toString());
      comment.replies?.forEach(reply => {
        if (reply.userId) userIds.add(reply.userId.toString());
      });
    });

    const users = await User.find({ 
      _id: { $in: Array.from(userIds) } 
    }).select('_id avatar').lean() as Array<Pick<IUser, '_id' | 'avatar'>>;

    const userAvatars = new Map(
      users.map(u => [u._id!.toString(), u.avatar])
    );

    // Add avatars to comments and replies
    if (post.comments) {
      post.comments = post.comments.map(comment => ({
        ...comment,
        userAvatar: userAvatars.get(comment.userId.toString())
      }));

      post.comments = post.comments.map(comment => ({
        ...comment,
        replies: (comment.replies || []).map(reply => ({
          ...reply,
          userAvatar: userAvatars.get(reply.userId.toString())
        }))
      }));
    }

    return NextResponse.json(post, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
