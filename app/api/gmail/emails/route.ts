import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

async function refreshAccessToken(user: any) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: user.gmailRefreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const tokens = await response.json();

  if (tokens.access_token) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gmailAccessToken: tokens.access_token,
        gmailTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });
    return tokens.access_token;
  }

  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.gmailConnected || !user?.gmailAccessToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    let accessToken = user.gmailAccessToken;

    // Check if token is expired
    if (user.gmailTokenExpiry && new Date() > user.gmailTokenExpiry) {
      accessToken = await refreshAccessToken(user);
      if (!accessToken) {
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 });
      }
    }

    // Fetch emails from Gmail API
    const response = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!data.messages) {
      return NextResponse.json([]);
    }

    // Fetch details for each email
    const emails = await Promise.all(
      data.messages.slice(0, 10).map(async (msg: any) => {
        const emailResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const emailData = await emailResponse.json();

        const headers = emailData.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        const isUnread = emailData.labelIds?.includes('UNREAD');

        // Get email body
        let body = '';
        if (emailData.payload?.body?.data) {
          body = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
        } else if (emailData.payload?.parts) {
          const textPart = emailData.payload.parts.find(
            (p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        }

        return {
          id: emailData.id,
          from: getHeader('From'),
          subject: getHeader('Subject'),
          preview: emailData.snippet || '',
          content: body,
          date: new Date(parseInt(emailData.internalDate)),
          read: !isUnread,
        };
      })
    );

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Gmail fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}