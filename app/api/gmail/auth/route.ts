import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Instead of trying to use NextAuth's built-in linking,
  // we'll direct users to sign in with Google
  // This will create/update the Account entry with Gmail permissions
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const authUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent('/dashboard')}`;

  return NextResponse.json({ authUrl });
}