import mongoose from 'mongoose';
import crypto from 'crypto';

const MONGODB_URI = 'mongodb+srv://sonuchrms:t8jMkLXA5kwLe2uL@ballotly.akx6qah.mongodb.net/sonuch_rms?appName=Ballotly';
const SUPER_ADMIN_EMAIL = 'workwithdan6@gmail.com';

function generateRandomSecureKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const segments = [];
  for (let i = 0; i < 5; i++) {
    let segment = '';
    const bytes = crypto.randomBytes(5);
    for (let j = 0; j < 5; j++) {
      segment += chars[bytes[j] % chars.length];
    }
    segments.push(segment);
  }
  return `UCH-${segments.join('-')}`;
}

async function resetDatabase() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB. Starting complete database wipe...');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    console.log(`[Wipe] Deleting all documents from collection: "${col.name}"`);
    await db.collection(col.name).deleteMany({});
  }

  console.log('All collections successfully wiped clean.');
  console.log('Seeding initial System Configuration with dynamic random key...');

  // 1. Generate dynamic, non-hardcoded mixed-case alphanumeric key
  const dynamicMasterKey = generateRandomSecureKey();

  await db.collection('systemconfigs').insertOne({
    adminAccessKey: dynamicMasterKey,
    superAdminEmail: SUPER_ADMIN_EMAIL.toLowerCase(),
    keyLastRotatedAt: new Date(),
    rotatedBy: 'Initial Dynamic Setup',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`[Seed] SystemConfig created with dynamic key: ${dynamicMasterKey}`);

  // 2. Seed AcademicSession
  await db.collection('academicsessions').insertOne({
    activeSession: '2026/2027',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('[Seed] AcademicSession initialized: 2026/2027');

  console.log('====================================================');
  console.log('DATABASE WIPE AND CLEAN RE-INITIALIZATION COMPLETE! ✨');
  console.log('Super Admin Email: ' + SUPER_ADMIN_EMAIL);
  console.log('Initial Master Access Key: ' + dynamicMasterKey);
  console.log('Active Session: 2026/2027');
  console.log('Policies: Clean Slate (Publish via Admin Policies CMS)');
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(0);
}

resetDatabase().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
