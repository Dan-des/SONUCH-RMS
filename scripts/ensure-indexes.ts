import fs from 'fs';
import path from 'path';

// Parse .env.local before importing mongoose or db
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        val = val.replace(/^['"]|['"]$/g, '').trim();
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn('Could not load .env.local', e);
}

async function buildAllIndexes() {
  const { default: connectToDatabase } = await import('../lib/db');
  const { default: User } = await import('../models/User');
  const { default: Grade } = await import('../models/Grade');
  const { default: Course } = await import('../models/Course');
  const { default: Otp } = await import('../models/Otp');
  const { default: Policy } = await import('../models/Policy');
  const { default: ResultRelease } = await import('../models/ResultRelease');
  const { default: SystemConfig } = await import('../models/SystemConfig');
  const { default: Notification } = await import('../models/Notification');
  const { default: UnlockRequest } = await import('../models/UnlockRequest');

  console.log('Connecting to MongoDB Atlas at', process.env.MONGODB_URI?.split('@')[1] || 'Atlas');
  await connectToDatabase();
  console.log('Connected! Syncing and building high-speed indexes across all collections on MongoDB Atlas...');

  await Promise.all([
    User.syncIndexes(),
    Grade.syncIndexes(),
    Course.syncIndexes(),
    Otp.syncIndexes(),
    Policy.syncIndexes(),
    ResultRelease.syncIndexes(),
    SystemConfig.syncIndexes(),
    Notification.syncIndexes(),
    UnlockRequest.syncIndexes(),
  ]);

  console.log('✓ All database collection indexes built and verified on MongoDB Atlas successfully!');
  process.exit(0);
}

buildAllIndexes().catch((err) => {
  console.error('Failed to build indexes:', err);
  process.exit(1);
});
