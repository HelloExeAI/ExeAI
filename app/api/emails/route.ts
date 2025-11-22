import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const demoEmails = [
      {
        id: '1',
        from: 'John Smith',
        subject: 'Project Update: EXEAI',
        preview: 'Just wanted to share the latest updates...',
        date: new Date().toISOString(),
        content: '<div><p>Hi,</p><p>Project is 90% complete!</p></div>',
        read: false
      },
      {
        id: '2',
        from: 'Sarah Johnson',
        subject: 'Invoice for November',
        preview: 'Please find attached the invoice...',
        date: new Date().toISOString(),
        content: '<div><p>Invoice details here</p></div>',
        read: false
      },
      {
        id: '3',
        from: 'Mike Davis',
        subject: 'Quick Question',
        preview: 'Hey, I had a quick question...',
        date: new Date().toISOString(),
        content: '<div><p>Question about AI feature</p></div>',
        read: false
      }
    ];

    return NextResponse.json(demoEmails);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}