import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

async function refreshAccessToken(user: any) {
  if (!user.gmailRefreshToken) {
    return null;
  }

  try {
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

    if (tokens.error) {
      console.error('Token refresh error:', tokens);
      return null;
    }

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
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.gmailConnected || !user?.gmailAccessToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    let accessToken = user.gmailAccessToken;

    // Check if token is expired and refresh if needed
    if (user.gmailTokenExpiry && new Date() > user.gmailTokenExpiry) {
      const newToken = await refreshAccessToken(user);
      if (!newToken) {
        // Mark as disconnected if refresh fails
        await prisma.user.update({
          where: { id: user.id },
          data: { gmailConnected: false },
        });
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 });
      }
      accessToken = newToken;
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gmail API error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch emails from Gmail' }, { status: 500 });
    }

    const data = await response.json();

    if (!data.messages || data.messages.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch details for each email (limit to 10 for performance)
    const emailPromises = data.messages.slice(0, 10).map(async (msg: any) => {
      try {
        const emailResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!emailResponse.ok) {
          return null;
        }

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
          // Try to find text/html first, then text/plain
          const htmlPart = emailData.payload.parts.find((p: any) => p.mimeType === 'text/html');
          const textPart = emailData.payload.parts.find((p: any) => p.mimeType === 'text/plain');
          
          const part = htmlPart || textPart;
          if (part?.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part?.parts) {
            // Handle nested parts
            const nestedPart = part.parts.find((p: any) => 
              p.mimeType === 'text/html' || p.mimeType === 'text/plain'
            );
            if (nestedPart?.body?.data) {
              body = Buffer.from(nestedPart.body.data, 'base64').toString('utf-8');
            }
          }
        }

        // Convert plain text to HTML if needed
        if (body && !body.includes('<')) {
          body = body.replace(/\n/g, '<br>');
        }

        return {
          id: emailData.id,
          from: getHeader('From'),
          subject: getHeader('Subject'),
          preview: emailData.snippet || '',
          content: body || emailData.snippet || '',
          date: new Date(parseInt(emailData.internalDate)),
          read: !isUnread,
        };
      } catch (error) {
        console.error('Error fetching email:', msg.id, error);
        return null;
      }
    });

    const emails = (await Promise.all(emailPromises)).filter(Boolean);

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Gmail fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}