import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  title: string;
  unit: number;
  level: string; // "100L", "200L", "300L", "400L", "500L"
  semester: 1 | 2;
  session: string; // e.g. "2026/2027"
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema<ICourse> = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    level: {
      type: String,
      required: true,
      enum: ['100L', '200L', '300L', '400L', '500L'],
      index: true,
    },
    semester: {
      type: Number,
      enum: [1, 2],
      required: true,
      index: true,
    },
    session: {
      type: String,
      required: true,
      default: '2026/2027',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast level and semester queries
CourseSchema.index({ code: 1, level: 1, semester: 1 });
CourseSchema.index({ level: 1, semester: 1, session: 1 });

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
