import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const pages = await prisma.page.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      pages: pages.map(page => ({
        id: page.id,
        title: page.title,
        content: page.content,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        userId: page.userId,
        tags: page.tags || []
      }))
    });

  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, tags } = body;

    const page = await prisma.page.create({
      data: {
        title: title || 'Untitled Page',
        content: content || '',
        tags: tags || [],
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        title: page.title,
        content: page.content,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        userId: page.userId,
        tags: page.tags || []
      }
    });

  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
