import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './User';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  role: UserRole;
  sessionToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema<ISession> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      required: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default Session;
