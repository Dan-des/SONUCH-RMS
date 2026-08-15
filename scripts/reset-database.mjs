import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://sonuchrms:t8jMkLXA5kwLe2uL@ballotly.akx6qah.mongodb.net/sonuch_rms?appName=Ballotly';
const SUPER_ADMIN_EMAIL = 'workwithdan6@gmail.com';
const MASTER_ACCESS_KEY = 'son-uch-2026-admin-access-key';

async function resetDatabase() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB. Starting database reset...');

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
  console.log('Seeding initial Master System Configuration...');

  // 1. Seed SystemConfig
  await db.collection('systemconfigs').insertOne({
    adminAccessKey: MASTER_ACCESS_KEY,
    superAdminEmail: SUPER_ADMIN_EMAIL.toLowerCase(),
    keyLastRotatedAt: new Date(),
    rotatedBy: 'System Initialization',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`[Seed] SystemConfig created with Master Access Key: ${MASTER_ACCESS_KEY}`);

  // 2. Seed AcademicSession
  await db.collection('academicsessions').insertOne({
    activeSession: '2026/2027',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('[Seed] AcademicSession initialized: 2026/2027');

  // 3. Seed Default Institutional Policies
  await db.collection('policies').insertMany([
    {
      title: '5.00 CGPA Grading Scale & Pass Mark Regulations',
      category: 'Grading & CGPA',
      content:
        'The School of Nursing, University College Hospital, Ibadan operates on an official 5-point grading scale. The minimum pass mark for all Nursing professional and basic science courses is 50% (Grade C, 3.00 GP). Continuous Assessment (CA) accounts for 30% and Terminal Examination accounts for 70%. Cumulative GPA below 1.50 attracts academic probation.',
      gradingScale: [
        { minScore: 70, maxScore: 100, letterGrade: 'A', gradePoint: 5.0, description: 'Distinction / Excellent' },
        { minScore: 60, maxScore: 69, letterGrade: 'B', gradePoint: 4.0, description: 'Very Good' },
        { minScore: 50, maxScore: 59, letterGrade: 'C', gradePoint: 3.0, description: 'Credit / Minimum Pass' },
        { minScore: 45, maxScore: 49, letterGrade: 'D', gradePoint: 2.0, description: 'Pass' },
        { minScore: 0, maxScore: 44, letterGrade: 'F', gradePoint: 0.0, description: 'Fail' },
      ],
      isArchived: false,
      updatedBy: SUPER_ADMIN_EMAIL,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Clinical Practicum & Ward Posting Regulations',
      category: 'Clinical & Ward Regulations',
      content:
        'All student nurses must maintain 100% attendance across assigned clinical wards, night duties, and community nursing postings. Missed shifts must be made up during vacation rotation prior to progression to the subsequent academic level.',
      isArchived: false,
      updatedBy: SUPER_ADMIN_EMAIL,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Examination Conduct & Academic Integrity',
      category: 'Examination Conduct',
      content:
        'Students must be seated in the examination hall 15 minutes before the commencement of any paper with their verified Student ID and Examination Slip. Any form of malpractice attracts immediate expulsion under NMCN regulations.',
      isArchived: false,
      updatedBy: SUPER_ADMIN_EMAIL,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('[Seed] Default Policies seeded successfully.');

  console.log('====================================================');
  console.log('DATABASE WIPE AND CLEAN RE-INITIALIZATION COMPLETE! ✨');
  console.log('Super Admin Email: ' + SUPER_ADMIN_EMAIL);
  console.log('Master Access UUID Key: ' + MASTER_ACCESS_KEY);
  console.log('Active Session: 2026/2027');
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(0);
}

resetDatabase().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
