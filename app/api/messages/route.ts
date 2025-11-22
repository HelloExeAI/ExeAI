import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo messages from WhatsApp and Slack
    const demoMessages = [
      {
        id: '1',
        platform: 'whatsapp',
        from: 'Sarah Thompson',
        preview: 'Hey! Can we reschedule our meeting to tomorrow?',
        content: 'Hey! Can we reschedule our meeting to tomorrow? Something urgent came up and I need to handle it today. Would 3 PM tomorrow work for you?',
        date: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        platform: 'slack',
        from: 'Mike Johnson',
        preview: 'The deployment is complete. Everything looks good!',
        content: 'The deployment is complete. Everything looks good! All tests passed and the new features are live. Let me know if you notice anything unusual.',
        date: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: '3',
        platform: 'whatsapp',
        from: 'Alex Rodriguez',
        preview: 'Thanks for the feedback on the design mockups!',
        content: 'Thanks for the feedback on the design mockups! I\'ve made the changes you suggested. The new color scheme looks much better. Can you review it when you have time?',
        date: new Date(Date.now() - 7200000).toISOString(),
        read: false
      },
      {
        id: '4',
        platform: 'slack',
        from: 'Emily Chen',
        preview: 'Quick question about the API documentation',
        content: 'Quick question about the API documentation - should we include the rate limiting info in the main docs or create a separate page for it? Also, do we need to document the deprecated endpoints?',
        date: new Date(Date.now() - 10800000).toISOString(),
        read: false
      }
    ];

    return NextResponse.json(demoMessages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}