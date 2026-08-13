import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationRead extends Document {
  notificationId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  readAt: Date;
}

const NotificationReadSchema: Schema<INotificationRead> = new Schema(
  {
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationReadSchema.index({ notificationId: 1, studentId: 1 }, { unique: true });

export const NotificationRead: Model<INotificationRead> =
  mongoose.models.NotificationRead ||
  mongoose.model<INotificationRead>('NotificationRead', NotificationReadSchema);

export default NotificationRead;
