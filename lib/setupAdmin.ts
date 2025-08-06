import { adminAuth } from './firebase-admin';
import { ADMIN_ACCOUNTS } from './adminConfig';

export async function setupAdminAccounts() {
    for (const admin of ADMIN_ACCOUNTS) {
        try {
            // Try to get the user
            const userRecord = await adminAuth.getUserByEmail(admin.email);

            // Update user claims if needed
            if (!userRecord.customClaims?.admin) {
                await adminAuth.setCustomUserClaims(userRecord.uid, {
                    admin: true,
                    role: admin.role
                });
            }
        } catch (error: any) {
            // If user doesn't exist, create them
            if (error.code === 'auth/user-not-found') {
                const newUser = await adminAuth.createUser({
                    email: admin.email,
                    password: admin.password,
                    displayName: admin.displayName,
                    emailVerified: true
                });

                await adminAuth.setCustomUserClaims(newUser.uid, {
                    admin: true,
                    role: admin.role
                });
            }
        }
    }
}
