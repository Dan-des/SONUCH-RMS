import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGrade extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  caScore: number;
  examScore: number;
  totalScore: number;
  gradePoint: number;
  letterGrade: string; // 'A' | 'B' | 'C' | 'D' | 'F'
  session: string;
  semester: 1 | 2;
  level: string;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema: Schema<IGrade> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    caScore: {
      type: Number,
      required: true,
      min: 0,
      max: 40,
    },
    examScore: {
      type: Number,
      required: true,
      min: 0,
      max: 70,
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    gradePoint: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    letterGrade: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      enum: [1, 2],
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast result generation and distinct record enforcement
GradeSchema.index({ studentId: 1, courseId: 1, session: 1 }, { unique: true });
GradeSchema.index({ studentId: 1, courseId: 1, level: 1, semester: 1 });
GradeSchema.index({ level: 1, semester: 1, session: 1 });

export const Grade: Model<IGrade> =
  mongoose.models.Grade || mongoose.model<IGrade>('Grade', GradeSchema);

export default Grade;
