#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runSetup() {
    console.log('🚀 Starting Tutorium setup process...');

    // 1. Check for .env.local file
    console.log('\n📝 Checking .env.local file...');
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.log('Creating .env.local file...');
        const envContent = `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAEvPBMq5wdHMTS-zL2075A8rAThrNSWf4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tutorium-a994f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tutorium-a994f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tutorium-a994f.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=80649296627
NEXT_PUBLIC_FIREBASE_APP_ID=1:80649296627:web:982006ca3968340e023586

# Add these from your Firebase service account
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=`;

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env.local file. Please fill in the Firebase service account details.');
    } else {
        console.log('✅ .env.local file exists');
    }

    // 2. Install dependencies
    console.log('\n📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
    } catch (error) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }

    // 3. Clear Next.js cache
    console.log('\n🧹 Clearing Next.js cache...');
    try {
        if (fs.existsSync('.next')) {
            fs.rmSync('.next', { recursive: true });
        }
        console.log('✅ Cache cleared successfully');
    } catch (error) {
        console.error('❌ Failed to clear cache');
    }

    // 4. Run database migrations if they exist
    if (fs.existsSync('./migration.js')) {
        console.log('\n🔄 Running database migrations...');
        try {
            execSync('node migration.js', { stdio: 'inherit' });
            console.log('✅ Migrations completed successfully');
        } catch (error) {
            console.error('❌ Failed to run migrations');
        }
    }

    // 5. Verify Firebase setup
    console.log('\n🔍 Verifying Firebase setup...');
    try {
        execSync('npx ts-node lib/verifySetup.ts', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Firebase verification failed');
    }

    console.log('\n📝 Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Fill in the Firebase service account details in .env.local');
    console.log('2. Run npm run dev to start the development server');
    console.log('3. Try logging in with an admin account');
}

runSetup();
