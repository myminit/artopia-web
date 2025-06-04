// File: models/CommunityPost.ts
import mongoose, { Schema, model, models, Document } from 'mongoose';

//
// 1. กำหนด interface ของ Report (ใช้ได้ทั้งระดับ Post, Comment, Reply)
//
interface IReport {
  _id:        string;
  userId:     string;
  reason:     string;
  detail?:    string;
  createdAt:  Date;
}

//
// 2. กำหนด interface ของ Reply (level-2)
//
interface IReply {
  _id:       string;
  userId:    string;
  userName:  string;
  text:      string;
  createdAt: Date;
  likes:     string[];      // เก็บ userId ของคนที่กด Like reply
  reports:   IReport[];     // เก็บ array ของ report ใต้ reply
}

//
// 3. กำหนด interface ของ Comment (level-1)
//
interface IComment {
  _id:       string;
  userId:    string;
  userName:  string;
  text:      string;
  createdAt: Date;
  likes:     string[];      // เก็บ userId ของคนที่กด Like comment
  reports:   IReport[];     // เก็บ array ของ report ใต้ comment
  replies:   IReply[];      // เก็บ array ของ replies ใต้ comment
}

//
// 4. กำหนด interface ของ CommunityPost
//
export interface ICommunityPost extends Document {
  userId:       string;
  userName:     string;
  caption:      string;
  imageUrl:     string;
  thumbnailUrl: string;
  likes:        string[];       // เก็บ userId ของคนที่กด Like โพสต์
  comments:     IComment[];     // array ของ comment (level-1)
  reports:      IReport[];      // array ของ report ระดับโพสต์
  createdAt:    Date;
  updatedAt:    Date;
}

//
// 5. สร้าง Schema สำหรับ Report
//
const ReportSchema = new Schema<IReport>({
  _id:        { type: String, required: true },
  userId:     { type: String, required: true },
  reason:     { type: String, required: true },
  detail:     { type: String, default: '' },
  createdAt:  { type: Date,   required: true }
});

//
// 6. สร้าง Schema สำหรับ Reply (level-2)
//
const ReplySchema = new Schema<IReply>({
  _id:        { type: String, required: true },
  userId:     { type: String, required: true },
  userName:   { type: String, required: true },
  text:       { type: String, required: true },
  createdAt:  { type: Date,   required: true },
  likes:      { type: [String], default: [] },
  reports:    { type: [ReportSchema], default: [] }
});

//
// 7. สร้าง Schema สำหรับ Comment (level-1)
//
const CommentSchema = new Schema<IComment>({
  _id:        { type: String, required: true },
  userId:     { type: String, required: true },
  userName:   { type: String, required: true },
  text:       { type: String, required: true },
  createdAt:  { type: Date,   required: true },
  likes:      { type: [String], default: [] },
  reports:    { type: [ReportSchema], default: [] },
  replies:    { type: [ReplySchema],  default: [] }
});

//
// 8. สร้าง Schema สำหรับ CommunityPost หลัก
//
const CommunityPostSchema = new Schema<ICommunityPost>({
  userId:       { type: String, required: true },
  userName:     { type: String, required: true },
  caption:      { type: String, required: true },
  imageUrl:     { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  likes:        { type: [String], default: [] },
  comments:     { type: [CommentSchema], default: [] },
  reports:      { type: [ReportSchema], default: [] }
}, { timestamps: true });

//
// 9. Export Model
//
const CommunityPost = models.CommunityPost || model<ICommunityPost>('CommunityPost', CommunityPostSchema);
export default CommunityPost;
