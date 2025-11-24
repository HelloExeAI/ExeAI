import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This is the user's email
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/settings?tab=email&error=access_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard/settings?tab=email&error=missing_params', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: process.env.GMAIL_REDIRECT_URI || 'https://exe-ai-mvif.vercel.app/api/gmail/callback',
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token error:', tokens);
      return NextResponse.redirect(new URL('/dashboard/settings?tab=email&error=token_error', request.url));
    }

    // Get user's Gmail profile
    const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    // Find user and update their Gmail tokens
    const user = await prisma.user.findUnique({
      where: { email: state },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/dashboard/settings?tab=email&error=user_not_found', request.url));
    }

    // Update user with Gmail tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token,
        gmailTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        gmailConnected: true,
        gmailEmail: profile.emailAddress,
      },
    });

    return NextResponse.redirect(new URL('/dashboard/settings?tab=email&success=gmail_connected', request.url));
  } catch (error) {
    console.error('Gmail callback error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?tab=email&error=server_error', request.url));
  }
}