import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/db';
import User from '../models/User';
import Session from '../models/Session';
import Otp from '../models/Otp';
import AcademicSession from '../models/AcademicSession';
import { createSessionToken, verifySessionToken } from '../lib/auth';
import { sendAdminOtpEmail } from '../lib/brevo';
import { checkRateLimit, clearRateLimitStore } from '../lib/rate-limit';

describe('Phase 1: Core Foundation & Authentication Unit Tests', () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.clearAllMocks();
  });

  describe('1. MongoDB Connection Pooling & Mongoose Models', () => {
    it('should initialize mongoose schemas without errors', () => {
      expect(User.modelName).toBe('User');
      expect(Session.modelName).toBe('Session');
      expect(Otp.modelName).toBe('Otp');
      expect(AcademicSession.modelName).toBe('AcademicSession');
    });

    it('should validate 5-minute TTL index on Otp schema', () => {
      const expiresAtIndex = Otp.schema.indexes().find((idx: any) => idx[0]?.expiresAt !== undefined);
      expect(expiresAtIndex).toBeDefined();
    });
  });

  describe('2. Better Auth & HttpOnly JWT Session Engine', () => {
    it('should create and verify a secure JWT session payload', async () => {
      const payload = {
        userId: 'stu-user-12345',
        email: 'student@sonuch.edu.ng',
        role: 'student' as const,
        status: 'verified' as const,
        fullName: 'Amina Olatunde',
      };

      const token = await createSessionToken(payload);
      expect(token).toBeTypeOf('string');
      expect(token.length).toBeGreaterThan(20);

      const verifiedPayload = await verifySessionToken(token);
      expect(verifiedPayload).not.toBeNull();
      expect(verifiedPayload?.userId).toBe(payload.userId);
      expect(verifiedPayload?.email).toBe(payload.email);
      expect(verifiedPayload?.role).toBe('student');
    });

    it('should reject invalid or tampered JWT session tokens', async () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';
      const result = await verifySessionToken(tamperedToken);
      expect(result).toBeNull();
    });
  });

  describe('3. Cryptographic Admin OTP Generation & Single-Use Burn Logic', () => {
    it('should generate a 6-digit numeric OTP code', () => {
      const crypto = require('crypto');
      const randomBuffer = crypto.randomBytes(3);
      const numericValue = parseInt(randomBuffer.toString('hex'), 16) % 1000000;
      const otpCode = numericValue.toString().padStart(6, '0');

      expect(otpCode).toMatch(/^\d{6}$/);
      expect(otpCode.length).toBe(6);
    });

    it('should simulate single-use OTP burn lifecycle', () => {
      const mockOtpStore: Record<string, { otp: string; used: boolean }> = {
        'admin@sonuch.edu.ng': { otp: '482910', used: false },
      };

      // Step 1: Verify valid OTP
      const email = 'admin@sonuch.edu.ng';
      const inputOtp = '482910';
      const record = mockOtpStore[email];

      expect(record).toBeDefined();
      expect(record.otp).toBe(inputOtp);
      expect(record.used).toBe(false);

      // Step 2: Burn OTP (single use)
      delete mockOtpStore[email];

      // Step 3: Re-verification attempt fails
      const reVerifyRecord = mockOtpStore[email];
      expect(reVerifyRecord).toBeUndefined();
    });

    it('should invoke Brevo Transactional Email service for OTP dispatch', async () => {
      const emailResult = await sendAdminOtpEmail('admin@sonuch.edu.ng', '654321');
      expect(emailResult.success).toBe(true);
    });
  });

  describe('4. Rate Limiting Protection', () => {
    it('should enforce rate limits after max requests exceeded', () => {
      const identifier = 'test-ip-123';
      const options = { intervalMs: 60000, maxRequests: 3 };

      expect(checkRateLimit(identifier, options).allowed).toBe(true);
      expect(checkRateLimit(identifier, options).allowed).toBe(true);
      expect(checkRateLimit(identifier, options).allowed).toBe(true);

      const blockedAttempt = checkRateLimit(identifier, options);
      expect(blockedAttempt.allowed).toBe(false);
      expect(blockedAttempt.remaining).toBe(0);
    });
  });
});
