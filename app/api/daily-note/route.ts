// app/api/daily-note/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';   
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET: Fetch daily note by date
 * Query params: date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find or create daily note
    let dailyNote = await prisma.dailyNote.findFirst({
      where: {
        userId: user.id,
        date: new Date(dateStr)
      }
    });

    // If no note exists, return empty content
    if (!dailyNote) {
      return NextResponse.json({
        date: dateStr,
        content: '',
        exists: false
      });
    }

    return NextResponse.json({
      id: dailyNote.id,
      date: dateStr,
      content: dailyNote.content,
      exists: true,
      createdAt: dailyNote.createdAt,
      updatedAt: dailyNote.updatedAt
    });

  } catch (error) {
    console.error('Error fetching daily note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST: Create or update daily note
 * Body: { date: string, content: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { date, content } = body;

    if (!date || content === undefined) {
      return NextResponse.json(
        { error: 'Date and content are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Upsert daily note (create or update)
    const dailyNote = await prisma.dailyNote.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date)
        }
      },
      update: {
        content,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        date: new Date(date),
        content
      }
    });

    return NextResponse.json({
      success: true,
      id: dailyNote.id,
      date: date,
      message: 'Daily note saved successfully'
    });

  } catch (error) {
    console.error('Error saving daily note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete daily note
 * Query params: date (YYYY-MM-DD)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete daily note
    await prisma.dailyNote.deleteMany({
      where: {
        userId: user.id,
        date: new Date(dateStr)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Daily note deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting daily note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}