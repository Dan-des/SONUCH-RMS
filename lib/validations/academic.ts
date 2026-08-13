import { z } from 'zod';

export const sessionConfigSchema = z.object({
  activeSession: z.string().regex(/^\d{4}\/\d{4}$/, 'Session format must be YYYY/YYYY (e.g. 2026/2027)'),
});

export const courseSchema = z.object({
  code: z.string().min(3, 'Course code is required').transform((val) => val.trim().toUpperCase()),
  title: z.string().min(3, 'Course title is required'),
  unit: z.coerce.number().min(1).max(6),
  level: z.enum(['100L', '200L', '300L', '400L', '500L']),
  semester: z.coerce.number().min(1).max(2),
  session: z.string().default('2026/2027'),
});

export const gradeInputSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  courseId: z.string().min(1, 'courseId is required'),
  caScore: z.coerce.number().min(0, 'Min CA is 0').max(40, 'Max CA is 40'),
  examScore: z.coerce.number().min(0, 'Min Exam is 0').max(70, 'Max Exam is 70'),
  session: z.string().default('2026/2027'),
  semester: z.coerce.number().min(1).max(2),
  level: z.string().default('100L'),
});

export const resultReleaseSchema = z.object({
  level: z.enum(['100L', '200L', '300L', '400L', '500L']),
  releaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid release date string',
  }),
  academicSession: z.string().default('2026/2027'),
});

export const policySchema = z.object({
  title: z.string().min(3, 'Policy title is required'),
  category: z.string().min(2, 'Category is required'),
  content: z.string().min(10, 'Policy content must be at least 10 characters'),
  isArchived: z.boolean().default(false),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
});

export const resetPasswordVerifySchema = z
  .object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be digits only'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SessionConfigInput = z.infer<typeof sessionConfigSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type GradeInput = z.infer<typeof gradeInputSchema>;
export type ResultReleaseInput = z.infer<typeof resultReleaseSchema>;
export type PolicyInput = z.infer<typeof policySchema>;
