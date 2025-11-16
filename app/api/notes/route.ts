// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get daily note by date or get all user notes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      // Get or create daily note for specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      let dailyNote = await prisma.dailyNote.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      // Create daily note if it doesn't exist
      if (!dailyNote) {
        dailyNote = await prisma.dailyNote.create({
          data: {
            userId: user.id,
            date: startOfDay,
            content: ''
          }
        });
      }

      // Get tasks for this daily note
      const tasks = await prisma.task.findMany({
        where: {
          dailyNoteId: dailyNote.id
        },
        orderBy: { createdAt: 'asc' }
      });

      // Transform to Page format
      const page = {
        id: dailyNote.id,
        title: date,
        createdAt: dailyNote.createdAt,
        lastModified: dailyNote.updatedAt,
        notes: tasks.map((task: any) => ({
          id: task.id,
          content: task.title,
          type: task.type,
          createdAt: task.createdAt,
          pageId: dailyNote.id,
          linkedPages: [],
          children: [],
          parentId: null,
          indent: 0,
          completed: task.completed || false
        }))
      };

      return NextResponse.json(page);
    } else {
      // Get all daily notes for the user
      const dailyNotes = await prisma.dailyNote.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      });

      return NextResponse.json(dailyNotes);
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      content, 
      type, 
      dailyNoteId, 
      parentId, 
      indent, 
      completed,
      linkedPages 
    } = body;

    // Validate required fields
    if (!content || !type || !dailyNoteId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the note as a task
    const note = await prisma.task.create({
      data: {
        title: content,
        description: content,
        type,
        dailyNoteId,
        userId: user.id,
        completed: completed || false,
        metadata: { parentId, indent, linkedPages }
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}