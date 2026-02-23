// app/api/calendar-events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { getCalendarClient } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

// GET - Get all calendar events
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
    const syncParam = searchParams.get('sync');
    const syncType = syncParam === 'true' ? 'full' : syncParam; // Backward compatibility

    // 1. Return local events INSTANTLY for normal loads (99% faster)
    if (!syncType || syncType === 'false') {
      const events = await prisma.task.findMany({
        where: {
          userId: user.id,
          type: { in: ['meeting', 'event', 'travel', 'birthday', 'reminder'] }
        },
        orderBy: { dueDate: 'asc' }
      });

      return NextResponse.json(events);
    }

    // 2. Run Google Calendar Sync based on requested time window (today vs 6 months)
    try {
      const calendar = await getCalendarClient(user.id);

      const now = new Date();
      const timeMin = new Date();
      const timeMax = new Date();

      if (syncType === 'today') {
        // Fast sync: strictly today
        timeMin.setHours(0, 0, 0, 0);
        timeMax.setHours(23, 59, 59, 999);
      } else {
        // Comprehensive sync: 2 weeks back, 6 months forward 
        timeMin.setDate(now.getDate() - 14);
        timeMax.setMonth(now.getMonth() + 6);
      }

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const googleEvents = response.data.items || [];

      for (const event of googleEvents) {
        if (!event.start || (!event.start.dateTime && !event.start.date)) continue;
        const start = event.start.dateTime || event.start.date;
        const end = event.end?.dateTime || event.end?.date || start;

        if (!event.id) continue;

        const existingTask = await prisma.task.findFirst({
          where: { userId: user.id, googleEventId: event.id }
        });

        const eventData = {
          title: event.summary || '(No Title)',
          description: event.description || '',
          dueDate: new Date(start as string),
          dueTime: new Date(end as string).toISOString(),
          metadata: {
            location: event.location,
            link: event.htmlLink,
            meetingLink: event.hangoutLink,
            attendees: event.attendees as any,
            lastSynced: new Date().toISOString()
          }
        };

        if (existingTask) {
          await prisma.task.update({ where: { id: existingTask.id }, data: eventData });
        } else {
          await prisma.task.create({
            data: {
              userId: user.id,
              type: 'meeting',
              googleEventId: event.id,
              ...eventData
            }
          });
        }
      }
    } catch (syncError: any) {
      console.warn('⚠️ Google Calendar sync failed:', syncError);

      if (syncError?.message?.includes('invalid_grant')) {
        await prisma.userSettings.update({
          where: { userId: user.id },
          data: { calendarGoogleConnected: false }
        });
      }
    }

    const updatedEvents = await prisma.task.findMany({
      where: {
        userId: user.id,
        type: { in: ['meeting', 'event', 'travel', 'birthday', 'reminder'] }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(updatedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// PATCH - Update an event
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, start, end, description, location } = body;

    if (!id || !title || !start || !end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update in DB
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: new Date(start),
        dueTime: new Date(end).toISOString(),
        metadata: {
          ...(typeof existingTask.metadata === 'object' ? existingTask.metadata as object : {}),
          location
        }
      }
    });

    // 2. Update in Google Calendar if linked
    if (existingTask.googleEventId) {
      try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
          const calendar = await getCalendarClient(user.id);

          await calendar.events.patch({
            calendarId: 'primary',
            eventId: existingTask.googleEventId,
            requestBody: {
              summary: title,
              description,
              location,
              start: {
                dateTime: new Date(start).toISOString()
              },
              end: {
                dateTime: new Date(end).toISOString()
              }
            }
          });
        }
      } catch (googleError) {
        console.error('Failed to update Google Calendar:', googleError);
        // Continue, we updated locally at least
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// POST - Create a new calendar event (Sync to Google)
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
    const { title, start, end, type, description, location, sourceNoteId } = body;

    // Validate
    if (!title || !start || !end || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Create in DB first
    let event = await prisma.task.create({
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

    // 2. Push to Google Calendar
    try {
      const calendar = await getCalendarClient(user.id);

      const newEvent = {
        summary: title,
        location: location,
        description: description,
        start: {
          dateTime: new Date(start).toISOString(),
          timeZone: 'Asia/Kolkata', // Should ideally come from user settings
        },
        end: {
          dateTime: new Date(end).toISOString(),
          timeZone: 'Asia/Kolkata',
        },
      };

      const googleRes = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: newEvent,
      });

      if (googleRes.data.id) {
        // Update DB with Google Event ID
        event = await prisma.task.update({
          where: { id: event.id },
          data: { googleEventId: googleRes.data.id }
        });
      }
    } catch (msg) {
      console.warn('Failed to push to Google Calendar:', msg);
      // We still return success but maybe with a warning? 
      // For now, silently failing the sync part is acceptable as long as local saves.
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}