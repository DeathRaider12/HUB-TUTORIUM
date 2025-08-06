import { adminAuth } from './firebase-admin';
import { ADMIN_ACCOUNTS } from './adminConfig';

async function initializeAdminUsers() {
    console.log('🚀 Initializing admin users...');

    for (const admin of ADMIN_ACCOUNTS) {
        try {
            console.log(`Processing admin account: ${admin.email}`);

            // Check if user exists
            try {
                const userRecord = await adminAuth.getUserByEmail(admin.email);
                console.log(`User exists: ${admin.email}`);

                // Update custom claims if needed
                if (!userRecord.customClaims?.admin) {
                    await adminAuth.setCustomUserClaims(userRecord.uid, {
                        admin: true,
                        role: 'admin'
                    });
                    console.log(`Updated admin claims for ${admin.email}`);
                }

                // Update user profile if needed
                if (userRecord.displayName !== admin.displayName) {
                    await adminAuth.updateUser(userRecord.uid, {
                        displayName: admin.displayName,
                        emailVerified: true
                    });
                    console.log(`Updated profile for ${admin.email}`);
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
                        role: 'admin'
                    });

                    console.log(`Created new admin user: ${admin.email}`);
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error(`Failed to process admin account ${admin.email}:`, error);
        }
    }

    console.log('✅ Admin initialization complete!');
}

// Run the initialization
initializeAdminUsers().catch(console.error);
