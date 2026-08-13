import { z } from 'zod';

export const studentSelfRegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
    matricNo: z
      .string()
      .min(5, 'Matriculation Number is required')
      .transform((val) => val.trim().toUpperCase()),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    admissionYear: z.coerce.number().min(2010, 'Invalid admission year').max(2035, 'Invalid admission year'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSetupSchema = z.object({
  stateOfOrigin: z.string().min(2, 'State of Origin is required'),
  lga: z.string().min(2, 'LGA of Origin is required'),
  dateOfBirth: z.string().min(4, 'Date of Birth is required'),
  nationality: z.string().default('Nigerian'),
  religion: z.string().min(2, 'Religion is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  avatarUrl: z.string().optional(),
});

export const unlockRequestSchema = z.object({
  reason: z.string().min(10, 'Reason for correction must be at least 10 characters long'),
});

export type StudentSelfRegisterInput = z.infer<typeof studentSelfRegisterSchema>;
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
export type UnlockRequestInput = z.infer<typeof unlockRequestSchema>;
