
import { google } from 'googleapis';
import prisma from './prisma';

export async function getCalendarClient(userId: string) {
    // 1. Get user's Google account
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: 'google',
        },
    });

    if (!account) {
        throw new Error('Google account not connected');
    }

    // 2. Setup OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    // 3. Check if token is expired (or close to expiring)
    // account.expires_at is usually in seconds (Unix timestamp)
    const now = Math.floor(Date.now() / 1000);
    const isExpired = account.expires_at ? account.expires_at < now + 60 : true; // Buffer 60s

    if (isExpired && account.refresh_token) {
        try {
            // Set credentials including refresh token
            oauth2Client.setCredentials({
                refresh_token: account.refresh_token,
            });

            // Refresh headers
            const { credentials } = await oauth2Client.refreshAccessToken();

            // Update in DB
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    access_token: credentials.access_token,
                    expires_at: Math.floor((credentials.expiry_date || Date.now()) / 1000),
                    refresh_token: credentials.refresh_token || account.refresh_token,
                },
            });

            oauth2Client.setCredentials(credentials);
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw new Error('Failed to refresh token');
        }
    } else if (account.access_token) {
        // Valid token
        oauth2Client.setCredentials({
            access_token: account.access_token,
            refresh_token: account.refresh_token,
        });
    } else {
        throw new Error('No access token available');
    }

    // 4. Return Calendar API client
    return google.calendar({ version: 'v3', auth: oauth2Client });
}
