import mongoose from 'mongoose';
import connectToDatabase from '../lib/db';
import User from '../models/User';
import Otp from '../models/Otp';
import SystemConfig from '../models/SystemConfig';
import { generateSecureAccessKey } from '../lib/crypto-key';
import { verifySessionToken, signSessionToken } from '../lib/auth';

const MONGODB_URI = 'mongodb+srv://sonuchrms:t8jMkLXA5kwLe2uL@ballotly.akx6qah.mongodb.net/sonuch_rms?appName=Ballotly';

async function testAuth() {
  console.log('--- Testing Database & Auth Connection ---');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  // Check SystemConfig
  const config = await SystemConfig.findOne();
  console.log('Current SystemConfig:', config ? {
    adminAccessKey: config.adminAccessKey,
    superAdminEmail: config.superAdminEmail,
  } : 'No SystemConfig found');

  // Test JWT Signing & Verifying
  const token = await signSessionToken({
    id: 'test-admin-id',
    email: 'workwithdan6@gmail.com',
    role: 'admin',
    status: 'verified',
  });
  console.log('Generated Test JWT Token length:', token.length);

  const verified = await verifySessionToken(token);
  console.log('Verified Test JWT Token payload:', verified);

  console.log('--- Auth Test Complete ---');
  await mongoose.disconnect();
}

testAuth().catch(console.error);
