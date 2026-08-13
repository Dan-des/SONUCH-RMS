import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TargetAudience = 'all' | '100L' | '200L' | '300L' | '400L' | '500L';

export interface INotification extends Document {
  title: string;
  message: string;
  priority: NotificationPriority;
  targetAudience: TargetAudience;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', '100L', '200L', '300L', '400L', '500L'],
      default: 'all',
      required: true,
      index: true,
    },
    createdBy: String,
  },
  {
    timestamps: true,
  }
);

// High performance compound index for targeted announcement queries
NotificationSchema.index({ targetAudience: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
