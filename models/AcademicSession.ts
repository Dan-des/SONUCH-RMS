import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAcademicSession extends Document {
  activeSession: string; // e.g. "2026/2027"
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicSessionSchema: Schema<IAcademicSession> = new Schema(
  {
    activeSession: {
      type: String,
      required: true,
      default: '2026/2027',
    },
    updatedBy: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const AcademicSession: Model<IAcademicSession> =
  mongoose.models.AcademicSession ||
  mongoose.model<IAcademicSession>('AcademicSession', AcademicSessionSchema);

export default AcademicSession;
