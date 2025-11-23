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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
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

    const dailyNote = await prisma.dailyNote.findFirst({
      where: {
        userId: user.id,
        date: new Date(date)
      }
    });

    return NextResponse.json({
      success: true,
      note: dailyNote ? {
        id: dailyNote.id,
        content: dailyNote.content,
        date: dailyNote.date,
        createdAt: dailyNote.createdAt,
        updatedAt: dailyNote.updatedAt
      } : null
    });

  } catch (error) {
    console.error('Error fetching daily note:', error);
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

    const body = await request.json();
    const { date, content } = body;

    if (!date || content === undefined) {
      return NextResponse.json(
        { success: false, error: 'Date and content are required' },
        { status: 400 }
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

    // Find existing note
    const existingNote = await prisma.dailyNote.findFirst({
      where: {
        userId: user.id,
        date: new Date(date)
      }
    });

    let dailyNote;

    if (existingNote) {
      // Update existing note
      dailyNote = await prisma.dailyNote.update({
        where: { id: existingNote.id },
        data: {
          content: content,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new note
      dailyNote = await prisma.dailyNote.create({
        data: {
          userId: user.id,
          date: new Date(date),
          content: content
        }
      });
    }

    return NextResponse.json({
      success: true,
      note: {
        id: dailyNote.id,
        content: dailyNote.content,
        date: dailyNote.date,
        createdAt: dailyNote.createdAt,
        updatedAt: dailyNote.updatedAt
      }
    });

  } catch (error) {
    console.error('Error saving daily note:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}