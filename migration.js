// integrated-migration.js
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    writeBatch,
    Timestamp,
    query,
    where
} from 'firebase/firestore';

// Your Firebase config (replace with your actual config)
import { firebaseConfig } from './config.js';
const firebaseConfig = {
    apiKey: "AIzaSyAEvPBMq5wdHMTS-zL2075A8rAThrNSWf4",
    authDomain: "tutorium-a994f.firebaseapp.com",
    projectId: "tutorium-a994f",
    storageBucket: "tutorium-a994f.firebasestorage.app",
    messagingSenderId: "80649296627",
    appId: "1:80649296627:web:982006ca3968340e023586",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class IntegratedDatabaseMigration {

    async migrateUsers() {
        console.log('🔄 Starting user migration...');

        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        if (snapshot.empty) {
            console.log('No users to migrate');
            return;
        }

        const batch = writeBatch(db);
        let count = 0;

        snapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const userId = userDoc.id;

            // Preserve ALL existing data and add new structure
            const newUserData = {
                // ===== PRESERVE ALL EXISTING FIELDS =====
                ...userData, // Keep everything that already exists

                // Ensure required fields exist
                email: userData.email || '',
                displayName: userData.displayName || userData.name || '',
                role: userData.role || 'student', // Keep existing role system
                createdAt: userData.createdAt || Timestamp.now(),
                updatedAt: Timestamp.now(),

                // ===== ADD NEW PROFILE STRUCTURE =====
                profile: {
                    name: userData.name || userData.displayName || '',
                    bio: userData.bio || '',
                    avatarUrl: userData.avatarUrl || userData.photoURL || userData.profilePicture || '',
                    credentials: userData.credentials || [],
                    publications: userData.publications || [],
                    expertise: userData.expertise || userData.skills || [],
                    institution: userData.institution || userData.school || userData.university || '',
                    linkedinProfile: userData.linkedinProfile || userData.linkedin || null,
                    rating: userData.rating || 0,
                    responseRate: userData.responseRate || 0,
                    verificationStatus: userData.role === 'lecturer' ? 'verified' : 'pending',
                    reputation: userData.reputation || userData.points || 0
                },

                // ===== ADD NEW STATS STRUCTURE =====
                stats: {
                    questionsAsked: userData.questionsAsked || userData.totalQuestions || 0,
                    answersGiven: userData.answersGiven || userData.totalAnswers || 0,
                    lessonsCreated: userData.lessonsCreated || userData.totalLessons || 0,
                    lessonsWatched: userData.lessonsWatched || userData.coursesCompleted || 0,
                    totalPoints: userData.totalPoints || userData.points || 0,
                    level: userData.level || 1,
                    experience: userData.experience || userData.xp || 0
                }
            };

            batch.set(doc(db, 'users', userId), newUserData);
            count++;
        });

        await batch.commit();
        console.log(`✅ Successfully migrated ${count} users with enhanced profiles`);
    }

    async migrateQuestions() {
        console.log('🔄 Migrating questions to enhanced structure...');

        const questionsRef = collection(db, 'questions');
        const snapshot = await getDocs(questionsRef);

        if (snapshot.empty) {
            console.log('No questions to migrate');
            return;
        }

        const batch = writeBatch(db);
        let count = 0;

        snapshot.forEach((questionDoc) => {
            const questionData = questionDoc.data();
            const questionId = questionDoc.id;

            // Enhance existing questions with new fields
            const enhancedQuestion = {
                ...questionData, // Keep all existing data

                // Add missing fields for new features
                followersCount: questionData.followersCount || 0,
                relatedQuestions: questionData.relatedQuestions || [],
                attachments: questionData.attachments || [],
                status: questionData.status || 'open',
                views: questionData.views || questionData.viewCount || 0,
                votes: questionData.votes || questionData.likes || 0,
                bounty: questionData.bounty || null,
                visibility: questionData.visibility || 'public',
                updatedAt: Timestamp.now()
            };

            batch.set(doc(db, 'questions', questionId), enhancedQuestion);
            count++;
        });

        await batch.commit();
        console.log(`✅ Successfully migrated ${count} questions`);
    }

    async migrateLessons() {
        console.log('🔄 Migrating lessons to enhanced structure...');

        const lessonsRef = collection(db, 'lessons');
        const snapshot = await getDocs(lessonsRef);

        if (snapshot.empty) {
            console.log('No lessons to migrate');
            return;
        }

        const batch = writeBatch(db);
        let count = 0;

        snapshot.forEach((lessonDoc) => {
            const lessonData = lessonDoc.data();
            const lessonId = lessonDoc.id;

            // Enhance existing lessons
            const enhancedLesson = {
                ...lessonData, // Keep all existing data

                // Add new fields
                chapters: lessonData.chapters || [],
                resources: lessonData.resources || lessonData.materials || [],
                difficulty: lessonData.difficulty || lessonData.level || 'beginner',
                transcription: lessonData.transcription || '',
                viewCount: lessonData.viewCount || lessonData.views || 0,
                rating: lessonData.rating || 0,
                updatedAt: Timestamp.now()
            };

            batch.set(doc(db, 'lessons', lessonId), enhancedLesson);
            count++;
        });

        await batch.commit();
        console.log(`✅ Successfully migrated ${count} lessons`);
    }

    async createInitialBadges() {
        console.log('🔄 Creating initial badges system...');

        const badges = [
            {
                name: "Welcome Aboard",
                description: "Successfully joined the platform",
                imageUrl: "/badges/welcome.png",
                criteria: "Complete registration",
                category: "onboarding",
                rarity: "common",
                createdAt: Timestamp.now()
            },
            {
                name: "First Question",
                description: "Asked your first question",
                imageUrl: "/badges/first-question.png",
                criteria: "Ask 1 question",
                category: "learning",
                rarity: "common",
                createdAt: Timestamp.now()
            },
            {
                name: "Problem Solver",
                description: "Provided your first answer",
                imageUrl: "/badges/first-answer.png",
                criteria: "Answer 1 question",
                category: "helping",
                rarity: "common",
                createdAt: Timestamp.now()
            },
            {
                name: "Knowledge Seeker",
                description: "Asked 10 questions",
                imageUrl: "/badges/knowledge-seeker.png",
                criteria: "Ask 10 questions",
                category: "learning",
                rarity: "uncommon",
                createdAt: Timestamp.now()
            },
            {
                name: "Helper",
                description: "Answered 10 questions",
                imageUrl: "/badges/helper.png",
                criteria: "Answer 10 questions",
                category: "helping",
                rarity: "uncommon",
                createdAt: Timestamp.now()
            },
            {
                name: "Educator",
                description: "Created your first lesson",
                imageUrl: "/badges/educator.png",
                criteria: "Create 1 lesson",
                category: "teaching",
                rarity: "uncommon",
                createdAt: Timestamp.now()
            },
            {
                name: "Master Teacher",
                description: "Created 5 high-quality lessons",
                imageUrl: "/badges/master-teacher.png",
                criteria: "Create 5 lessons with 4+ rating",
                category: "teaching",
                rarity: "rare",
                createdAt: Timestamp.now()
            }
        ];

        const batch = writeBatch(db);

        badges.forEach((badge) => {
            const badgeRef = doc(collection(db, 'badges'));
            batch.set(badgeRef, badge);
        });

        await batch.commit();
        console.log(`✅ Created ${badges.length} initial badges`);
    }

    async createAchievementTemplates() {
        console.log('🔄 Creating achievement templates...');

        const templates = [
            {
                name: "Question Master",
                description: "Ask 50 questions",
                total: 50,
                category: "learning",
                rewards: ["Question Master badge", "100 bonus points"],
                createdAt: Timestamp.now()
            },
            {
                name: "Answer Hero",
                description: "Provide 25 helpful answers",
                total: 25,
                category: "helping",
                rewards: ["Answer Hero badge", "150 bonus points"],
                createdAt: Timestamp.now()
            },
            {
                name: "Lesson Creator",
                description: "Create 10 educational lessons",
                total: 10,
                category: "teaching",
                rewards: ["Lesson Creator badge", "300 bonus points"],
                createdAt: Timestamp.now()
            },
            {
                name: "Study Buddy",
                description: "Join 3 study groups",
                total: 3,
                category: "community",
                rewards: ["Study Buddy badge", "75 bonus points"],
                createdAt: Timestamp.now()
            }
        ];

        const batch = writeBatch(db);

        templates.forEach((template) => {
            const templateRef = doc(collection(db, 'achievement_templates'));
            batch.set(templateRef, template);
        });

        await batch.commit();
        console.log(`✅ Created ${templates.length} achievement templates`);
    }

    async initializeAnalytics() {
        console.log('🔄 Initializing analytics system...');

        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        const initialAnalytics = {
            date: Timestamp.now(),
            userEngagement: {
                activeUsers: 0,
                averageSessionDuration: 0,
                questionsAsked: 0,
                answersGiven: 0,
                lessonViews: 0
            },
            contentPerformance: {
                topPerformingLessons: [],
                popularTags: [],
                averageRating: 0,
                completionRate: 0
            },
            learningMetrics: {
                quizCompletionRate: 0,
                averageScore: 0,
                skillProgress: {}
            },
            retentionMetrics: {
                dailyActiveUsers: 0,
                weeklyActiveUsers: 0,
                monthlyActiveUsers: 0,
                churnRate: 0
            },
            responseMetrics: {
                averageResponseTime: 0,
                resolutionRate: 0,
                satisfactionScore: 0
            }
        };

        await setDoc(doc(db, 'analytics', dateString), initialAnalytics);
        console.log(`✅ Analytics initialized for ${dateString}`);
    }

    async createSystemConfig() {
        console.log('🔄 Creating system configuration...');

        const systemConfig = {
            platform: {
                name: "Educational Platform",
                version: "2.0.0",
                maintenanceMode: false,
                maxFileSize: 10 * 1024 * 1024, // 10MB
                allowedFileTypes: ["image/jpeg", "image/png", "application/pdf", "text/plain"]
            },
            gamification: {
                enabled: true,
                pointsPerQuestion: 10,
                pointsPerAnswer: 15,
                pointsPerLessonCreate: 50,
                pointsPerLessonComplete: 5
            },
            features: {
                studyGroups: true,
                videoLessons: true,
                quizzes: true,
                whiteboard: true,
                codeEditor: true,
                mathEditor: true
            },
            limits: {
                maxStudyGroupsPerUser: 10,
                maxQuestionsPerDay: 20,
                maxAnswersPerDay: 50
            },
            updatedAt: Timestamp.now()
        };

        await setDoc(doc(db, 'system_config', 'main'), systemConfig);
        console.log('✅ System configuration created');
    }

    async runFullMigration() {
        try {
            console.log('🚀 Starting comprehensive database migration...');
            console.log('This will enhance your existing data with new features');

            // Step 1: Migrate existing data with enhancements
            await this.migrateUsers();
            await this.migrateQuestions();
            await this.migrateLessons();

            // Step 2: Create new gamification system
            await this.createInitialBadges();
            await this.createAchievementTemplates();

            // Step 3: Initialize new systems
            await this.initializeAnalytics();
            await this.createSystemConfig();
            await this.initializeStudyGroups();

            console.log('🎉 Migration completed successfully!');
            console.log('Your platform now supports:');
            console.log('  ✅ Enhanced user profiles with roles preserved');
            console.log('  ✅ Improved questions and lessons');
            console.log('  ✅ Gamification system (badges, achievements)');
            console.log('  ✅ Study groups feature');
            console.log('  ✅ Analytics tracking');
            console.log('  ✅ All your existing data preserved');

        } catch (error) {
            console.error('❌ Migration failed:', error);
            console.error('Please check your Firebase configuration and permissions');
            throw error;
        }
    }

    // Helper method to create achievements for existing users
    async initializeStudyGroups() {
        console.log('🔄 Initializing study groups system...');

        const initialGroups = [
            {
                name: "Engineering Basics",
                description: "A group for discussing fundamental engineering concepts",
                topics: ["mathematics", "physics", "mechanics"],
                maxMembers: 50,
                visibility: "public",
                meetingSchedule: "Every Monday at 3 PM UTC",
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            },
            {
                name: "Programming Practice",
                description: "Collaborative coding and problem-solving",
                topics: ["algorithms", "data structures", "coding challenges"],
                maxMembers: 30,
                visibility: "public",
                meetingSchedule: "Every Wednesday at 5 PM UTC",
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }
        ];

        const batch = writeBatch(db);

        initialGroups.forEach((group) => {
            const groupRef = doc(collection(db, 'study_groups'));
            batch.set(groupRef, group);
        });

        await batch.commit();
        console.log(`✅ Created ${initialGroups.length} initial study groups`);
    }

    async createAchievementsForExistingUsers() {
        console.log('🔄 Creating achievements for existing users...');

        const users = await getDocs(collection(db, 'users'));
        const templates = await getDocs(collection(db, 'achievement_templates'));

        let userCount = 0;

        for (const userDoc of users.docs) {
            const batch = writeBatch(db);
            const userId = userDoc.id;

            templates.forEach((template) => {
                const achievementRef = doc(collection(db, 'achievements'));
                batch.set(achievementRef, {
                    userId,
                    name: template.data().name,
                    description: template.data().description,
                    progress: 0,
                    total: template.data().total,
                    completedAt: null,
                    rewards: template.data().rewards,
                    createdAt: Timestamp.now()
                });
            });

            await batch.commit();
            userCount++;
        }

        console.log(`✅ Created achievements for ${userCount} existing users`);
    }
}

// ===== USAGE =====

// Create migration instance
const migration = new IntegratedDatabaseMigration();

// Run the full migration
migration.runFullMigration()
    .then(async () => {
        console.log('🔧 Setting up achievements for existing users...');
        await migration.createAchievementsForExistingUsers();
        console.log('✅ All migration tasks completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration failed:', error);
        console.error('');
        console.error('Troubleshooting tips:');
        console.error('1. Check your Firebase configuration');
        console.error('2. Ensure you have proper permissions');
        console.error('3. Make sure you created a backup first!');
        console.error('4. Check your internet connection');
        process.exit(1);
    });

// Export for individual use
export { IntegratedDatabaseMigration };