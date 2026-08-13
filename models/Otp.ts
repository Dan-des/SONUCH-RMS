import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const OtpSchema: Schema<IOtp> = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // 5-minute TTL index (MongoDB automatically removes document when current time > expiresAt)
      index: { expires: 0 },
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default Otp;
