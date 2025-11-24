import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ connected: false, error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        gmailConnected: true,
        gmailEmail: true,
        gmailTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json({ connected: false, error: 'User not found' });
    }

    // Check if token is expired
    const isExpired = user.gmailTokenExpiry && new Date() > user.gmailTokenExpiry;

    return NextResponse.json({
      connected: user.gmailConnected && !isExpired,
      email: user.gmailEmail,
      expired: isExpired,
    });
  } catch (error) {
    console.error('Gmail status error:', error);
    return NextResponse.json({ connected: false, error: 'Failed to check status' });
  }
}