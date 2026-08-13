import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../lib/db';
import Policy from '../../../models/Policy';
import { verifySessionToken, COOKIE_NAME } from '../../../lib/auth';
import { policySchema } from '../../../lib/validations/academic';

export const dynamic = 'force-dynamic';

const DEFAULT_POLICIES = [
  {
    title: '5.0 CGPA Grading Scale & 50% Pass Mark Requirement',
    category: 'Grading & CGPA',
    content:
      'In accordance with Nursing and Midwifery Council of Nigeria (NMCN) standards and UCH Academic Board regulations, the minimum pass mark for all nursing courses (theory and practical) is 50% (Grade C).\n\nGrading Scale:\n- A: 70% – 100% (5.0 Grade Points)\n- B: 60% – 69% (4.0 Grade Points)\n- C: 50% – 59% (3.0 Grade Points)\n- F: Below 50% (0.0 Grade Points - Fail)',
    isArchived: false,
    updatedBy: 'system@sonuch.edu.ng',
  },
  {
    title: 'Clinical Ward Postings & 85% Attendance Regulations',
    category: 'Clinical & Ward Regulations',
    content:
      '1. Student nurses must achieve a minimum of 85% attendance in all clinical ward postings per semester to qualify for semester examinations.\n2. Absence from clinical duty due to illness must be certified by the UCH Staff & Student Clinic within 24 hours.\n3. Ward duty shift logs must be signed daily by the Nursing Officer in Charge.',
    isArchived: false,
    updatedBy: 'system@sonuch.edu.ng',
  },
  {
    title: 'Academic Probation & Repeat Policy',
    category: 'Probation & Withdrawal',
    content:
      '1. Any student whose Cumulative Grade Point Average (CGPA) falls below 2.50 at the end of an academic session shall be placed on Academic Probation.\n2. A student on probation who fails to raise their CGPA to 2.50 by the end of the subsequent session shall be recommended for Academic Withdrawal.',
    isArchived: false,
    updatedBy: 'system@sonuch.edu.ng',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    await connectToDatabase();

    // Auto-seed default policies if empty
    const count = await Policy.countDocuments();
    if (count === 0) {
      await Policy.insertMany(DEFAULT_POLICIES);
    }

    const query: any = {};

    if (!includeArchived) {
      query.isArchived = false;
    }

    if (category) {
      query.category = category;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const policies = await Policy.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      policies: policies.map((p) => ({
        id: (p._id as any).toString(),
        title: p.title,
        category: p.category,
        content: p.content,
        isArchived: p.isArchived,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err: any) {
    console.error('[Policies GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = policySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const { title, category, content, isArchived } = parsed.data;

    const newPolicy = await Policy.create({
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      isArchived,
      updatedBy: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Academic Policy published successfully.',
      policy: {
        id: (newPolicy._id as any).toString(),
        title: newPolicy.title,
        category: newPolicy.category,
        content: newPolicy.content,
      },
    });
  } catch (err: any) {
    console.error('[Policies POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
