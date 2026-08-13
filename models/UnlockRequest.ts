import mongoose, { Schema, Document, Model } from 'mongoose';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface IUnlockRequest extends Document {
  userId: mongoose.Types.ObjectId;
  studentName: string;
  matricNo: string;
  email: string;
  reason: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UnlockRequestSchema: Schema<IUnlockRequest> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    matricNo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: String,
    reviewedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

export const UnlockRequest: Model<IUnlockRequest> =
  mongoose.models.UnlockRequest ||
  mongoose.model<IUnlockRequest>('UnlockRequest', UnlockRequestSchema);

export default UnlockRequest;
