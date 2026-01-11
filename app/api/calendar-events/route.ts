// app/api/calendar-events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { getCalendarClient } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

// GET - Get all calendar events (Sync from Google first)
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

    // 1. Try to sync from Google Calendar
    try {
      // Check if user has Google Calendar connected
      const settings = await prisma.userSettings.findUnique({
        where: { userId: user.id }
      });

      // Only sync if enabled or strict sync requested (ignoring settings for now to ensure it works)
      const calendar = await getCalendarClient(user.id);

      // Define sync range: Start of last month to 6 months ahead
      // We go back 1 month to ensure we catch recent past events/recurrences
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 6, 1);

      console.log(`🔄 Syncing Google Calendar from ${timeMin.toISOString()} to ${timeMax.toISOString()}`);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const googleEvents = response.data.items || [];
      console.log(`📥 Fetched ${googleEvents.length} events from Google`);

      // Sync events to DB
      let syncedCount = 0;
      for (const event of googleEvents) {
        if (!event.start || (!event.start.dateTime && !event.start.date)) continue;

        // Handle all-day vs timed events
        const start = event.start.dateTime || event.start.date; // ISO string or YYYY-MM-DD
        const end = event.end?.dateTime || event.end?.date || start;

        // Ensure we have a valid date object
        const startDate = new Date(start as string);
        const endDate = new Date(end as string);

        if (!event.id) continue;

        // Check if event already exists
        const existingTask = await prisma.task.findFirst({
          where: {
            userId: user.id,
            googleEventId: event.id
          }
        });

        const eventData = {
          title: event.summary || '(No Title)',
          description: event.description || '',
          dueDate: startDate,
          dueTime: endDate.toISOString(),
          metadata: {
            location: event.location,
            link: event.htmlLink,
            lastSynced: new Date().toISOString()
          }
        };

        if (existingTask) {
          // Update existing
          await prisma.task.update({
            where: { id: existingTask.id },
            data: eventData
          });
        } else {
          // Create new
          await prisma.task.create({
            data: {
              userId: user.id,
              type: 'meeting', // Default type
              googleEventId: event.id,
              ...eventData
            }
          });
        }
        syncedCount++;
      }
      console.log(`✅ Successfully synced ${syncedCount} events`);

    } catch (syncError: any) {
      // Log but don't fail the request - return local events
      console.warn('⚠️ Google Calendar sync skipped/failed:', syncError);

      // If we are in dev mode, maybe return this error?
      // For now, let's just log deeply
      if (syncError.response) {
        console.error('Google API Error:', syncError.response.data);
      }
    }

    // 2. Return local events (now updated)
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