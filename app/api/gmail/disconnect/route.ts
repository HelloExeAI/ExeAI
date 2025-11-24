import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Revoke access token if exists
    if (user.gmailAccessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${user.gmailAccessToken}`, {
          method: 'POST',
        });
      } catch (error) {
        // Continue even if revoke fails
        console.error('Token revoke error:', error);
      }
    }

    // Clear Gmail data from user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gmailConnected: false,
        gmailEmail: null,
        gmailAccessToken: null,
        gmailRefreshToken: null,
        gmailTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gmail disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}