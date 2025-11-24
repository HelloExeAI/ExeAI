import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://exe-ai-mvif.vercel.app';

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=access_denied`, baseUrl));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=missing_params`, baseUrl));
  }

  try {
    const redirectUri = process.env.GMAIL_REDIRECT_URI || `${baseUrl}/api/gmail/callback`;

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
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token error:', tokens);
      return NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=token_error`, baseUrl));
    }

    // Get user's Gmail profile
    const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    if (profile.error) {
      console.error('Profile error:', profile);
      return NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=profile_error`, baseUrl));
    }

    // Find user by email (state contains the user's email)
    const userEmail = decodeURIComponent(state);
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error('User not found:', userEmail);
      return NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=user_not_found`, baseUrl));
    }

    // Update user with Gmail tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token || null,
        gmailTokenExpiry: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000) 
          : null,
        gmailConnected: true,
        gmailEmail: profile.emailAddress,
      },
    });

    return NextResponse.redirect(new URL(`/dashboard/settings?tab=email&success=gmail_connected`, baseUrl));
  } catch (error) {
    console.error('Gmail callback error:', error);
    return NextResponse.redirect(new URL(`/dashboard/settings?tab=email&error=server_error`, baseUrl));
  }
}