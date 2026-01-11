
import { NextRequest, NextResponse } from 'next/server';
import { connectToWhatsApp, getWhatsAppStatus, disconnectWhatsApp } from '@/lib/whatsapp';
import QRCode from 'qrcode';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    // Check Status
    const status = getWhatsAppStatus();

    // Generate QR Image Data URL if QR exists
    let qrImage = null;
    if (status.qrCode) {
        try {
            qrImage = await QRCode.toDataURL(status.qrCode);
        } catch (err) {
            console.error('Failed to generate QR image', err);
        }
    }

    return NextResponse.json({
        ...status,
        qrImage
    });
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'connect') {
        connectToWhatsApp();
        return NextResponse.json({ message: 'Initializing connection...' });
    } else if (action === 'disconnect') {
        disconnectWhatsApp();

        // Also update DB
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
            await prisma.userSettings.update({
                where: { userId: user.id },
                data: { messageWhatsAppConnected: false }
            });
        }

        return NextResponse.json({ message: 'Disconnected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
