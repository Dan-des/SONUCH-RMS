import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../lib/db';
import Policy from '../../../models/Policy';
import { verifySessionToken, COOKIE_NAME } from '../../../lib/auth';
import { policySchema } from '../../../lib/validations/academic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    await connectToDatabase();
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
