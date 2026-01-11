import prisma from '@/lib/prisma';

export async function getGuestUser() {
    const email = 'guest@exeai.com';

    try {
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('Creating guest user...');
            user = await prisma.user.create({
                data: {
                    email,
                    name: 'Guest User',
                    subscriptionTier: 'pro',
                    subscriptionStatus: 'active',
                    image: '/guest-avatar.png' // Optional
                }
            });
        }

        return user;
    } catch (error) {
        console.error('Error getting guest user:', error);
        // Fallback to finding any user
        return await prisma.user.findFirst();
    }
}
