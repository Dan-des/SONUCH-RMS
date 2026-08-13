import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGradingRule {
  minScore: number;
  maxScore: number;
  letterGrade: string; // 'A', 'B', 'C', 'D', 'E', 'F'
  gradePoint: number;  // 5.0, 4.0, 3.0, 2.0, 0.0
  description?: string;
}

export interface IPolicy extends Document {
  title: string;
  category: string; // e.g. "Grading & CGPA", "Examination Conduct", "Probation & Withdrawal", "Clinical Regulations"
  content: string;
  gradingScale?: IGradingRule[];
  isArchived: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GradingRuleSchema = new Schema<IGradingRule>(
  {
    minScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    letterGrade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
    description: String,
  },
  { _id: false }
);

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
    gradingScale: [GradingRuleSchema],
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

PolicySchema.index({ category: 1, isArchived: 1 });

export const Policy: Model<IPolicy> =
  mongoose.models.Policy || mongoose.model<IPolicy>('Policy', PolicySchema);

export default Policy;
