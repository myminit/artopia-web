// File: app/api/community/[postid]/comment/[commentid]/report/route.ts
import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Report from "@/models/Report";
import CommunityPost from "@/models/CommunityPost";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { postid: string; commentid: string } }
) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value || "";
    const payload = verifyToken(token);
    if (!payload) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { reason, detail, reportUserId } = await req.json();

    if (!reason || !reportUserId) {
      return new Response("Missing required fields", { status: 400 });
    }

    const post = await CommunityPost.findById(params.postid);
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    const comment = post.comments.id(params.commentid);
    if (!comment) {
      return new Response("Comment not found", { status: 404 });
    }

    // Get user name from database
    const user = await User.findById(payload._id);
    const userName = user?.name || "Unknown User";

    const report = await Report.create({
      byUserId: payload._id,
      reportUserId,
      reason,
      detail: detail || "",
      postId: params.postid,
      commentId: params.commentid
    });

    comment.reports.push({
      _id: report._id.toString(),
      userId: payload._id,
      userName: userName,
      reason,
      detail: detail || "",
      createdAt: new Date()
    });

    await post.save();

    return Response.json(report);
  } catch (error) {
    console.error("Error creating comment report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
