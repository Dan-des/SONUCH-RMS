import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPolicy extends Document {
  title: string;
  category: string; // e.g. "Grading & CGPA", "Examination Conduct", "Probation & Withdrawal", "Clinical Regulations"
  content: string;
  isArchived: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySchema: Schema<IPolicy> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'General Academic Rules',
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    updatedBy: String,
  },
  {
    timestamps: true,
  }
);

export const Policy: Model<IPolicy> =
  mongoose.models.Policy || mongoose.model<IPolicy>('Policy', PolicySchema);

export default Policy;
