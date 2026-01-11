
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

// Store the socket connection in a global variable to prevent garbage collection
// Note: In serverless (Vercel), this global variable may be lost on cold starts.
// For production, this needs a persistent process or a DB-backed session store.

let waSocket: any = null;
let qrCode: string | null = null;
let connectionStatus: 'open' | 'connecting' | 'close' = 'close';
let messageStore: any[] = [];

const AUTH_DIR = path.join(process.cwd(), 'whatsapp_auth');

export async function connectToWhatsApp() {
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: 'silent' }) as any,
        browser: ['ExeAI', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCode = qr;
            connectionStatus = 'connecting';
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            connectionStatus = 'close';

            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                // Determine if logged out (delete auth)
                if (fs.existsSync(AUTH_DIR)) {
                    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                }
            }
        } else if (connection === 'open') {
            console.log('Opened connection');
            connectionStatus = 'open';
            qrCode = null;
        }
    });

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
            for (const msg of m.messages) {
                if (!msg.message || msg.key.fromMe) continue;

                // Extract text
                const text = msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    'Media message';

                const newMessage = {
                    id: msg.key.id,
                    platform: 'whatsapp',
                    from: msg.pushName || msg.key.remoteJid?.split('@')[0] || 'Unknown',
                    preview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                    content: text,
                    date: new Date(),
                    read: false
                };

                // Add to store (prevent duplicates)
                if (!messageStore.find(x => x.id === newMessage.id)) {
                    messageStore.unshift(newMessage);
                    // Keep only last 50
                    if (messageStore.length > 50) messageStore.pop();
                }
            }
        }
    });

    waSocket = sock;
    return sock;
}

export function getRealMessages() {
    return messageStore;
}

export function getWhatsAppStatus() {
    return {
        status: connectionStatus,
        qrCode: qrCode
    };
}

export async function disconnectWhatsApp() {
    if (waSocket) {
        waSocket.end(undefined);
        waSocket = null;
        connectionStatus = 'close';
        qrCode = null;

        // Clean up auth files
        if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        }
    }
}
