import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  message: z.string().min(5, 'Message body must be at least 5 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  targetAudience: z.enum(['all', '100L', '200L', '300L', '400L', '500L']).default('all'),
});

export const markNotificationReadSchema = z.object({
  notificationId: z.string().min(1, 'notificationId is required'),
});

export const exportQuerySchema = z.object({
  level: z.string().optional(),
  status: z.string().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
