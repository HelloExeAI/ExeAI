// app/api/calendar-events/route.ts
import { NextRequest, NextResponse } from 'next/server';    
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';   
import prisma from '@/lib/prisma'; 

// GET - Get all calendar events for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all calendar events for this user (using Task model with type filter)
    const events = await prisma.task.findMany({
      where: { 
        userId: user.id,
        type: { in: ['meeting', 'event', 'travel', 'birthday', 'reminder'] }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, start, end, type, description, location, sourceNoteId } = body;

    // Validate required fields
    if (!title || !start || !end || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the calendar event (using Task model)
    const event = await prisma.task.create({
      data: {
        title,
        description: description || location || '',
        type,
        dueDate: new Date(start),
        dueTime: new Date(end).toISOString(),
        userId: user.id,
        metadata: { location, sourceNoteId }
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}