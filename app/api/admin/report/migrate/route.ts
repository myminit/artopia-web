import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import Report from '@/models/Report';
import { getUserFromReq } from "@/utils/auth";
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting migration process...');

    // 1) Check admin authorization
    const userPayload = await getUserFromReq(req);
    if (!userPayload || userPayload.role !== 'admin') {
      console.error('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Admin authorization successful');

    // 2) Connect to MongoDB
    try {
      await connectDB();
      console.log('MongoDB connection successful');
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error.message 
      }, { status: 500 });
    }

    // 3) Get all posts with reports
    let posts;
    try {
      posts = await CommunityPost.find({ 
        $or: [
          { 'reports.0': { $exists: true } },
          { 'comments.reports.0': { $exists: true } },
          { 'comments.replies.reports.0': { $exists: true } }
        ]
      });
      console.log(`Found ${posts.length} posts with reports`);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch posts',
        details: error.message 
      }, { status: 500 });
    }

    let migratedCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // 4) For each post
    for (const post of posts) {
      console.log(`Processing post ${post._id}`);
      
      // 4.1) Migrate post-level reports
      if (post.reports?.length > 0) {
        console.log(`Found ${post.reports.length} reports in post ${post._id}`);
      }

      for (const report of post.reports || []) {
        try {
          if (!report.userId) {
            throw new Error('Missing reporter userId');
          }

          await Report.create({
            byUserId: new mongoose.Types.ObjectId(report.userId),
            reportUserId: new mongoose.Types.ObjectId(post.userId),
            reason: report.reason,
            detail: report.detail || '',
            createdAt: report.createdAt || new Date(),
            type: 'post',
            contentId: post._id
          });
          migratedCount++;
        } catch (err) {
          console.error('Error migrating post report:', {
            postId: post._id,
            reportUserId: report.userId,
            error: err.message
          });
          errorCount++;
          errors.push({
            type: 'post',
            postId: post._id,
            reportData: {
              byUserId: report.userId,
              reportUserId: post.userId,
              reason: report.reason
            },
            error: err.message
          });
        }
      }

      // 4.2) Migrate comment-level reports
      if (post.comments?.length > 0) {
        console.log(`Processing ${post.comments.length} comments in post ${post._id}`);
      }

      for (const comment of post.comments || []) {
        // Reports on comments
        if (comment.reports?.length > 0) {
          console.log(`Found ${comment.reports.length} reports in comment ${comment._id}`);
        }

        for (const report of comment.reports || []) {
          try {
            if (!report.userId) {
              throw new Error('Missing reporter userId');
            }

            await Report.create({
              byUserId: new mongoose.Types.ObjectId(report.userId),
              reportUserId: new mongoose.Types.ObjectId(comment.userId),
              reason: report.reason,
              detail: report.detail || '',
              createdAt: report.createdAt || new Date(),
              type: 'comment',
              contentId: comment._id,
              postId: post._id
            });
            migratedCount++;
          } catch (err) {
            console.error('Error migrating comment report:', {
              postId: post._id,
              commentId: comment._id,
              reportUserId: report.userId,
              error: err.message
            });
            errorCount++;
            errors.push({
              type: 'comment',
              postId: post._id,
              commentId: comment._id,
              reportData: {
                byUserId: report.userId,
                reportUserId: comment.userId,
                reason: report.reason
              },
              error: err.message
            });
          }
        }

        // Reports on replies
        if (comment.replies?.length > 0) {
          console.log(`Processing ${comment.replies.length} replies in comment ${comment._id}`);
        }

        for (const reply of comment.replies || []) {
          if (reply.reports?.length > 0) {
            console.log(`Found ${reply.reports.length} reports in reply ${reply._id}`);
          }

          for (const report of reply.reports || []) {
            try {
              if (!report.userId) {
                throw new Error('Missing reporter userId');
              }

              await Report.create({
                byUserId: new mongoose.Types.ObjectId(report.userId),
                reportUserId: new mongoose.Types.ObjectId(reply.userId),
                reason: report.reason,
                detail: report.detail || '',
                createdAt: report.createdAt || new Date(),
                type: 'reply',
                contentId: reply._id,
                postId: post._id,
                commentId: comment._id
              });
              migratedCount++;
            } catch (err) {
              console.error('Error migrating reply report:', {
                postId: post._id,
                commentId: comment._id,
                replyId: reply._id,
                reportUserId: report.userId,
                error: err.message
              });
              errorCount++;
              errors.push({
                type: 'reply',
                postId: post._id,
                commentId: comment._id,
                replyId: reply._id,
                reportData: {
                  byUserId: report.userId,
                  reportUserId: reply.userId,
                  reason: report.reason
                },
                error: err.message
              });
            }
          }
        }
      }
    }

    console.log('Migration completed:', {
      migratedCount,
      errorCount,
      hasErrors: errors.length > 0
    });

    return NextResponse.json({ 
      message: 'Migration completed',
      migratedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error.message 
    }, { status: 500 });
  }
} 