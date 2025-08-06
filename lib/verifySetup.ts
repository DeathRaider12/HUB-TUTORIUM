import { adminAuth, adminDb } from './firebase-admin';
import { auth } from './firebase';
import { setupAdminAccounts } from './setupAdmin';

export async function verifyFirebaseSetup() {
    console.log('🔍 Starting Firebase setup verification...');

    const checks = {
        envVars: false,
        adminSDK: false,
        clientSDK: false,
        adminAccounts: false,
        firestore: false
    };

    try {
        // 1. Check environment variables
        console.log('\n📝 Checking environment variables...');
        const requiredEnvVars = [
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_PRIVATE_KEY',
            'NEXT_PUBLIC_FIREBASE_API_KEY'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length === 0) {
            console.log('✅ All required environment variables are set');
            checks.envVars = true;
        } else {
            console.error('❌ Missing environment variables:', missingVars.join(', '));
        }

        // 2. Verify Admin SDK Connection
        console.log('\n🔐 Verifying Firebase Admin SDK connection...');
        try {
            await adminAuth.listUsers(1);
            console.log('✅ Firebase Admin SDK connection successful');
            checks.adminSDK = true;
        } catch (error) {
            console.error('❌ Firebase Admin SDK connection failed:', error.message);
        }

        // 3. Verify Client SDK Connection
        console.log('\n🔌 Verifying Firebase Client SDK connection...');
        try {
            await auth.signInAnonymously();
            await auth.signOut();
            console.log('✅ Firebase Client SDK connection successful');
            checks.clientSDK = true;
        } catch (error) {
            console.error('❌ Firebase Client SDK connection failed:', error.message);
        }

        // 4. Setup and verify admin accounts
        console.log('\n👤 Setting up admin accounts...');
        try {
            await setupAdminAccounts();
            console.log('✅ Admin accounts setup successful');
            checks.adminAccounts = true;
        } catch (error) {
            console.error('❌ Admin accounts setup failed:', error.message);
        }

        // 5. Verify Firestore connection
        console.log('\n📁 Verifying Firestore connection...');
        try {
            await adminDb.collection('_test_connection').add({
                test: true,
                timestamp: new Date()
            });
            console.log('✅ Firestore connection successful');
            checks.firestore = true;
        } catch (error) {
            console.error('❌ Firestore connection failed:', error.message);
        }

        // Summary
        console.log('\n📋 Setup Verification Summary:');
        Object.entries(checks).forEach(([key, value]) => {
            console.log(`${value ? '✅' : '❌'} ${key}`);
        });

        const allChecksPass = Object.values(checks).every(v => v);
        if (allChecksPass) {
            console.log('\n🎉 All checks passed! Your Firebase setup is complete and working.');
        } else {
            console.log('\n⚠️ Some checks failed. Please review the errors above and fix them.');
        }

        return checks;
    } catch (error) {
        console.error('❌ Setup verification failed:', error);
        return checks;
    }
}
