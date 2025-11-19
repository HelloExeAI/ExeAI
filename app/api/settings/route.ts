// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { DEFAULT_USER_SETTINGS } from '@/types/settings';

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
          worldClocks: DEFAULT_USER_SETTINGS.worldClocks ?? [],
        },
      });
      return NextResponse.json(newSettings);
    }

    return NextResponse.json(user.settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}