import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'admin' | 'student';
export type VerificationStatus = 'pending_verification' | 'verified';

export interface IUser extends Document {
  email: string;
  password?: string;
  fullName: string;
  matricNo?: string;
  role: UserRole;
  status: VerificationStatus;
  admissionYear?: number;
  canEditRegistration: boolean;
  unlockExpiresAt?: Date;
  stateOfOrigin?: string;
  lga?: string;
  dateOfBirth?: string;
  nationality?: string;
  religion?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    matricNo: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_verification', 'verified'],
      default: 'pending_verification',
      required: true,
    },
    admissionYear: {
      type: Number,
      required: false,
    },
    canEditRegistration: {
      type: Boolean,
      default: false,
    },
    unlockExpiresAt: {
      type: Date,
      required: false,
    },
    stateOfOrigin: String,
    lga: String,
    dateOfBirth: String,
    nationality: String,
    religion: String,
    phone: String,
    avatarUrl: String,
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
