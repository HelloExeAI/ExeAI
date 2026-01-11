import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getGmailClient } from '@/lib/google-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get User ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const gmail = await getGmailClient(user.id);

    // 1. List messages (unread first, or just inbox)
    // q: 'is:unread in:inbox' to get unread
    // or just 'in:inbox' for all
    // Let's get unread first as user requested "fetch emails" usually implies seeing new stuff
    // But UI shows "unreadEmails.length > 0", so maybe we fetch all recent and filter?
    // The UI filters `emails.filter(e => !e.read)`. So let's fetch recent inbox.
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:inbox',
      maxResults: 10,
    });

    const messages = listRes.data.messages || [];

    if (messages.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch details for each message
    const emails = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          });

          const payload = detail.data.payload;
          const headers = payload?.headers;

          const getHeader = (name: string) => headers?.find(h => h.name === name)?.value || '';

          const from = getHeader('From');
          const subject = getHeader('Subject');
          const dateStr = getHeader('Date');
          const date = new Date(dateStr);

          // Determine snippet/body
          let content = detail.data.snippet || ''; // Default to snippet

          // Try to find HTML body
          // This is a simplified traversal. Gmail structure can be complex (multipart/alternative inside multipart/mixed etc)
          const findBody = (parts: any[]): string | null => {
            if (!parts) return null;
            // Prefer HTML
            const htmlPart = parts.find(p => p.mimeType === 'text/html');
            if (htmlPart && htmlPart.body?.data) {
              return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
            }
            // Fallback to plain text
            const textPart = parts.find(p => p.mimeType === 'text/plain');
            if (textPart && textPart.body?.data) {
              return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
            // Recurse
            for (const part of parts) {
              if (part.parts) {
                const found = findBody(part.parts);
                if (found) return found;
              }
            }
            return null;
          };

          const fullBody = findBody(payload?.parts || []);
          if (fullBody) content = fullBody;

          return {
            id: msg.id,
            from,
            subject,
            preview: detail.data.snippet, // Keep preview separate
            date: date,
            content: content, // Full content for popup
            read: !detail.data.labelIds?.includes('UNREAD'),
          };
        } catch (e) {
          console.error(`Failed to fetch message ${msg.id}`, e);
          return null;
        }
      })
    );

    return NextResponse.json(emails.filter(e => e !== null));

  } catch (error: any) {
    const errorMessage = error.message || '';
    console.error('API Error:', error);

    if (errorMessage === 'Gmail not connected' || errorMessage.includes('No access token')) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    if (errorMessage.includes('insufficient authentication scopes') ||
      errorMessage.includes('Insufficient Permission')) {
      return NextResponse.json({
        error: 'Permissions missing. Please disconnect and reconnect Gmail in Settings.'
      }, { status: 403 });
    }

    return NextResponse.json({ error: errorMessage || 'Internal Server Error' }, { status: 500 });
  }
}