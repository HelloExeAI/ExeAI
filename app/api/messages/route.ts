import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch real messages from WhatsApp connection
    let realMessages: any[] = [];
    try {
      const { getRealMessages } = await import('@/lib/whatsapp');
      realMessages = getRealMessages();
    } catch (e) {
      console.error('Failed to get real messages', e);
    }

    // Sort by date desc
    return NextResponse.json(realMessages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}