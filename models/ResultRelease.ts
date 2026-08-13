import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResultRelease extends Document {
  level: string; // "100L", "200L", "300L", "400L", "500L"
  releaseDate: Date;
  isReleased: boolean;
  academicSession: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResultReleaseSchema: Schema<IResultRelease> = new Schema(
  {
    level: {
      type: String,
      required: true,
      enum: ['100L', '200L', '300L', '400L', '500L'],
      index: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    isReleased: {
      type: Boolean,
      default: false,
    },
    academicSession: {
      type: String,
      required: true,
      default: '2026/2027',
    },
    updatedBy: String,
  },
  {
    timestamps: true,
  }
);

ResultReleaseSchema.index({ level: 1, academicSession: 1 }, { unique: true });

export const ResultRelease: Model<IResultRelease> =
  mongoose.models.ResultRelease ||
  mongoose.model<IResultRelease>('ResultRelease', ResultReleaseSchema);

export default ResultRelease;
