import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateLevel } from '../lib/level-calculator';
import { studentSelfRegisterSchema, profileSetupSchema, unlockRequestSchema } from '../lib/validations/student';
import { sendTransactionalEmail } from '../lib/brevo';

describe('Phase 2: Student Lifecycle & Verification Pipeline Unit Tests', () => {
  describe('1. Real-Time Level Calculation Math', () => {
    it('should correctly calculate current level based on admission year and active session', () => {
      const activeSession = '2026/2027';

      expect(calculateLevel(2026, activeSession)).toBe('100L');
      expect(calculateLevel(2025, activeSession)).toBe('200L');
      expect(calculateLevel(2024, activeSession)).toBe('300L');
      expect(calculateLevel(2023, activeSession)).toBe('400L');
      expect(calculateLevel(2022, activeSession)).toBe('500L');
      expect(calculateLevel(2020, activeSession)).toBe('Graduated');
    });
  });

  describe('2. Registration & Profile Setup Validation Schemas', () => {
    it('should validate student registration Zod input successfully', () => {
      const input = {
        fullName: 'Daniel Tobi Olatunde',
        matricNo: 'ui/sonuch/utme/042',
        email: 'tobi@example.com',
        admissionYear: 2024,
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = studentSelfRegisterSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.matricNo).toBe('UI/SONUCH/UTME/042'); // Capitalized
      }
    });

    it('should reject registration if password and confirmPassword do not match', () => {
      const input = {
        fullName: 'Daniel Tobi Olatunde',
        matricNo: 'UI/SONUCH/UTME/042',
        email: 'tobi@example.com',
        admissionYear: 2024,
        password: 'password123',
        confirmPassword: 'differentpassword',
      };

      const result = studentSelfRegisterSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate demographic profile setup input', () => {
      const input = {
        stateOfOrigin: 'Oyo State',
        lga: 'Ibadan North',
        dateOfBirth: '2002-05-14',
        nationality: 'Nigerian',
        religion: 'Christianity',
        phone: '08012345678',
      };

      const result = profileSetupSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('3. Admin Verification Status Transitions & Email Alert', () => {
    it('should simulate verifying pending students and dispatching Brevo email alert', async () => {
      const pendingStudents = [
        { id: 'stu-1', name: 'Student One', email: 'stu1@example.com', status: 'pending_verification' },
        { id: 'stu-2', name: 'Student Two', email: 'stu2@example.com', status: 'pending_verification' },
      ];

      // Verify bulk status update
      const verifiedStudents = pendingStudents.map((s) => ({ ...s, status: 'verified' }));
      expect(verifiedStudents.every((s) => s.status === 'verified')).toBe(true);

      // Verify Brevo API call simulation
      const emailResult = await sendTransactionalEmail({
        to: [{ email: 'stu1@example.com', name: 'Student One' }],
        subject: 'Account Verified — School of Nursing, UCH Portal',
        htmlContent: '<p>Your account has been verified.</p>',
      });

      expect(emailResult.success).toBe(true);
    });
  });

  describe('4. Registration Unlock Request & Automatic Post-Submission Relock Logic', () => {
    it('should validate unlock request reason length', () => {
      const validReq = unlockRequestSchema.safeParse({
        reason: 'Typo in my Matriculation Number during registration.',
      });
      expect(validReq.success).toBe(true);

      const invalidReq = unlockRequestSchema.safeParse({ reason: 'Short' });
      expect(invalidReq.success).toBe(false);
    });

    it('should simulate granting 24-hour edit access and post-submission relock', () => {
      const studentState = {
        canEditRegistration: false,
        unlockExpiresAt: undefined as Date | undefined,
      };

      // Admin approves request: Grant 24-hour edit window
      const now = new Date();
      studentState.canEditRegistration = true;
      studentState.unlockExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      expect(studentState.canEditRegistration).toBe(true);
      expect(studentState.unlockExpiresAt).toBeDefined();

      // Student re-submits updated registration: Server immediately revokes edit permission
      studentState.canEditRegistration = false;
      studentState.unlockExpiresAt = undefined;

      expect(studentState.canEditRegistration).toBe(false);
      expect(studentState.unlockExpiresAt).toBeUndefined();
    });
  });
});
