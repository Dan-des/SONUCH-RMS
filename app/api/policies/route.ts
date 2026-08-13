import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../lib/db';
import Policy from '../../../models/Policy';
import { verifySessionToken, COOKIE_NAME } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

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

    const policies = await Policy.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      policies: policies.map((p: any) => ({
        id: (p._id as any).toString(),
        title: p.title,
        category: p.category,
        content: p.content,
        gradingScale: p.gradingScale || [],
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
    const { title, category, content, gradingScale, isArchived = false } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Policy title and content are required' }, { status: 400 });
    }

    await connectToDatabase();

    const newPolicy = await Policy.create({
      title: title.trim(),
      category: category ? category.trim() : 'General Academic Rules',
      content: content.trim(),
      gradingScale: Array.isArray(gradingScale) ? gradingScale : undefined,
      isArchived: Boolean(isArchived),
      updatedBy: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Academic Policy & rules published successfully.',
      policy: {
        id: (newPolicy._id as any).toString(),
        title: newPolicy.title,
        category: newPolicy.category,
        content: newPolicy.content,
        gradingScale: newPolicy.gradingScale,
      },
    });
  } catch (err: any) {
    console.error('[Policies POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, category, content, gradingScale, isArchived } = body;

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const updateFields: any = { updatedBy: session.email };
    if (title !== undefined) updateFields.title = title.trim();
    if (category !== undefined) updateFields.category = category.trim();
    if (content !== undefined) updateFields.content = content.trim();
    if (gradingScale !== undefined) updateFields.gradingScale = gradingScale;
    if (isArchived !== undefined) updateFields.isArchived = Boolean(isArchived);

    const updated = await Policy.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Policy record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Academic Policy updated successfully.',
      policy: {
        id: (updated._id as any).toString(),
        title: updated.title,
        category: updated.category,
        content: updated.content,
        gradingScale: updated.gradingScale,
        isArchived: updated.isArchived,
      },
    });
  } catch (err: any) {
    console.error('[Policies PATCH Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required for deletion' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Policy.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Policy record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Policy "${deleted.title}" deleted successfully.`,
    });
  } catch (err: any) {
    console.error('[Policies DELETE Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
