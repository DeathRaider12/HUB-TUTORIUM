import { adminAuth } from '@/lib/firebase-admin';
import { isAdminAccount, validateAdminCredentials } from '@/lib/adminConfig';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        // First validate if this is a known admin account
        if (!isAdminAccount(email)) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Then validate the credentials
        if (!validateAdminCredentials(email, password)) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Get the Firebase user
        try {
            const userRecord = await adminAuth.getUserByEmail(email);

            // Verify admin claim
            const customClaims = userRecord.customClaims || {};
            if (!customClaims.admin) {
                return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
            }

            // Create a custom token for the admin
            const customToken = await adminAuth.createCustomToken(userRecord.uid, {
                admin: true
            });

            return NextResponse.json({ token: customToken });
        } catch (error) {
            console.error('Admin auth error:', error);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
