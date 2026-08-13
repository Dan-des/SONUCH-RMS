import { z } from 'zod';

export const adminCredentialsSchema = z.object({
  email: z.string().email('Please enter a valid admin email address'),
  accessKey: z.string().min(6, 'Admin Access Key must be at least 6 characters'),
});

export const adminOtpVerifySchema = z.object({
  email: z.string().email('Please enter a valid admin email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

export const studentRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  matricNo: z.string().min(5, 'Matriculation number is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  admissionYear: z.number().min(2010, 'Invalid admission year').max(2035, 'Invalid admission year'),
});

export const studentLoginSchema = z.object({
  matricNo: z.string().min(1, 'Matriculation number is required'),
  password: z.string().min(1, 'Password is required'),
});

export type AdminCredentialsInput = z.infer<typeof adminCredentialsSchema>;
export type AdminOtpVerifyInput = z.infer<typeof adminOtpVerifySchema>;
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
export type StudentLoginInput = z.infer<typeof studentLoginSchema>;
