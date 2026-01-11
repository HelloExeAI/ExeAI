import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ connected: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { accounts: true }
  });

  const gmailAccount = user?.accounts.find(acc => acc.provider === 'google');

  return NextResponse.json({
    connected: !!gmailAccount
  });
}