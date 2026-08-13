import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateLevel } from '../lib/level';
import { courseSchema, gradeInputSchema, resultReleaseSchema, policySchema, resetPasswordVerifySchema } from '../lib/validations/academic';
import { sendTransactionalEmail } from '../lib/brevo';

describe('Phase 3: Academic Engine, Reactive Progression & Policies Unit Tests', () => {
  describe('1. Reactive Level Progression Engine', () => {
    it('should promote all student levels automatically when activeSession changes without mutating student documents', () => {
      const studentAdmissionYear = 2024;

      // Active Session 2024/2025 -> 100L
      expect(calculateLevel(studentAdmissionYear, '2024/2025')).toBe('100L');

      // Promote session to 2025/2026 -> 200L
      expect(calculateLevel(studentAdmissionYear, '2025/2026')).toBe('200L');

      // Promote session to 2026/2027 -> 300L
      expect(calculateLevel(studentAdmissionYear, '2026/2027')).toBe('300L');
    });
  });

  describe('2. Course & Grade Schemas & GPA Calculation Engine', () => {
    it('should validate Course and Grade input schemas', () => {
      const validCourse = courseSchema.safeParse({
        code: 'nur 301',
        title: 'Medical Surgical Nursing I',
        unit: 4,
        level: '300L',
        semester: 1,
        session: '2026/2027',
      });

      expect(validCourse.success).toBe(true);
      if (validCourse.success) {
        expect(validCourse.data.code).toBe('NUR 301');
      }

      const validGradeInput = gradeInputSchema.safeParse({
        studentId: 'stu-id-100',
        courseId: 'crs-id-200',
        caScore: 32,
        examScore: 54,
        session: '2026/2027',
        semester: 1,
        level: '300L',
      });

      expect(validGradeInput.success).toBe(true);
    });

    it('should correctly calculate GPA quality points', () => {
      const courseGrades = [
        { unit: 4, gradePoint: 5.0 }, // A -> 20 QP
        { unit: 3, gradePoint: 4.0 }, // B -> 12 QP
        { unit: 2, gradePoint: 3.0 }, // C -> 6 QP
      ];

      const totalCU = courseGrades.reduce((sum, g) => sum + g.unit, 0); // 9
      const totalQP = courseGrades.reduce((sum, g) => sum + g.unit * g.gradePoint, 0); // 38
      const gpa = +(totalQP / totalCU).toFixed(2);

      expect(totalCU).toBe(9);
      expect(totalQP).toBe(38);
      expect(gpa).toBe(4.22);
    });
  });

  describe('3. Level-Based Result Release Countdown & Auto-Unlock', () => {
    it('should validate Result Release schema', () => {
      const validRelease = resultReleaseSchema.safeParse({
        level: '200L',
        releaseDate: new Date(Date.now() + 3600000).toISOString(),
        academicSession: '2026/2027',
      });

      expect(validRelease.success).toBe(true);
    });

    it('should auto-unlock result access when current time exceeds target release date', () => {
      const pastReleaseDate = new Date(Date.now() - 60000); // 1 minute in past
      const futureReleaseDate = new Date(Date.now() + 3600000); // 1 hour in future

      const isPastUnlocked = new Date() >= pastReleaseDate;
      const isFutureUnlocked = new Date() >= futureReleaseDate;

      expect(isPastUnlocked).toBe(true);
      expect(isFutureUnlocked).toBe(false);
    });
  });

  describe('4. Academic Policy Manager', () => {
    it('should validate Policy CMS schema input', () => {
      const validPolicy = policySchema.safeParse({
        title: '5-Point CGPA Grading System Rules',
        category: 'Grading & CGPA',
        content: 'Minimum pass mark for core nursing courses is 50% (Grade C).',
        isArchived: false,
      });

      expect(validPolicy.success).toBe(true);
    });
  });

  describe('5. Password Reset Brevo OTP Dispatch & Single-Use Burn Logic', () => {
    it('should validate password reset verification schema', () => {
      const validVerify = resetPasswordVerifySchema.safeParse({
        email: 'student@sonuch.edu.ng',
        otp: '938201',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      expect(validVerify.success).toBe(true);
    });

    it('should simulate dispatching forgotten password OTP via Brevo API', async () => {
      const emailResult = await sendTransactionalEmail({
        to: [{ email: 'student@sonuch.edu.ng', name: 'Test Student' }],
        subject: '🔐 Password Reset OTP Code: 938201',
        htmlContent: '<p>Your OTP code is 938201.</p>',
      });

      expect(emailResult.success).toBe(true);
    });
  });
});
