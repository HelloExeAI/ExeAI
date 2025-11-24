// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { DEFAULT_USER_SETTINGS, WorldClock } from '@/types/settings';   

// GET /api/settings - Fetch user settings
export async function GET(request: NextRequest) { 
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If no settings exist, create default settings
    if (!user.settings) {
      const newSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          ...DEFAULT_USER_SETTINGS,
          worldClocks: DEFAULT_USER_SETTINGS.worldClocks ? JSON.stringify(DEFAULT_USER_SETTINGS.worldClocks as unknown as WorldClock[]) : null, 
        },
      });
      return NextResponse.json(newSettings);
    }

    return NextResponse.json(user.settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    // Provide more detailed error information
    const errorMessage = error?.message || 'Failed to fetch settings';
    const errorName = error?.name || 'UnknownError';
    return NextResponse.json({ 
      error: 'Failed to fetch settings',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      errorType: errorName
    }, { status: 500 });
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create settings
    let updatedSettings;
    
    if (user.settings) {
      // Update existing settings
      updatedSettings = await prisma.userSettings.update({
        where: { userId: user.id },
        data: body,
      });
    } else {
      // Create new settings with defaults + updates
      updatedSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          ...DEFAULT_USER_SETTINGS,
          worldClocks: (body.worldClocks ?? DEFAULT_USER_SETTINGS.worldClocks) ?? [],
          ...body,
        },
      });
    }

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    const errorMessage = error?.message || 'Failed to update settings';
    const errorName = error?.name || 'UnknownError';
    return NextResponse.json({ 
      error: 'Failed to update settings',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      errorType: errorName
    }, { status: 500 });
  }
}