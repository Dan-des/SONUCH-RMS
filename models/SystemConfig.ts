import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemConfig extends Document {
  adminAccessKey: string;
  superAdminEmail: string;
  keyLastRotatedAt: Date;
  rotatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema: Schema = new Schema(
  {
    adminAccessKey: {
      type: String,
      required: true,
      trim: true,
      default: 'son-uch-2026-admin-access-key',
    },
    superAdminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      default: 'workwithdan6@gmail.com',
    },
    keyLastRotatedAt: {
      type: Date,
      default: Date.now,
    },
    rotatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SystemConfig: Model<ISystemConfig> =
  (mongoose.models.SystemConfig as Model<ISystemConfig>) ||
  mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);

export default SystemConfig;
