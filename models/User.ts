import mongoose, { models, model, Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  resetPasswordOTP: string | null;
  resetPasswordOTPExpires: Date | null;
  verificationOTP: string | null;
  verificationOTPExpires: Date | null;
  bio?: string; 
  avatar?: string; 
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  resetPasswordOTP: { type: String, default: null },
  resetPasswordOTPExpires: { type: Date, default: null },
  verificationOTP: { type: String, default: null },
  verificationOTPExpires: { type: Date, default: null },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

const User = models.User || model<IUser>('User', UserSchema);

export default User;
