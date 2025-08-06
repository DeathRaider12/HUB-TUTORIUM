// Core Interfaces
export interface Question {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    bounty?: number;          // Optional points reward
    visibility: 'public' | 'private' | 'institution';
    relatedQuestions: string[]; // Similar questions
    followersCount: number;   // Users following the question
    attachments: Attachment[];
    status: 'open' | 'answered' | 'closed';
    views: number;
    votes: number;
}

export interface Attachment {
    id: string;
    type: 'image' | 'pdf' | 'code' | 'other';
    url: string;
    name: string;
    size: number;
}

export interface Profile {
    id: string;
    userId: string;
    name: string;
    bio: string;
    avatarUrl: string;
    credentials: string[];
    publications: string[];
    expertise: string[];
    institution: string;
    linkedinProfile?: string;
    rating: number;
    responseRate: number;
    badges: Badge[];
    verificationStatus: 'pending' | 'verified' | 'expert';
    achievements: Achievement[];
    reputation: number;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    authorId: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    transcription: string;    // Searchable text
    chapters: Chapter[];      // Structured segments
    quizzes: Quiz[];         // Assessment tools
    resources: Resource[];    // Additional materials
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    viewCount: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Chapter {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    summary: string;
}

export interface Quiz {
    id: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface Resource {
    id: string;
    type: 'pdf' | 'code' | 'link' | 'exercise';
    title: string;
    description: string;
    url: string;
}

export interface Analytics {
    id: string;
    timestamp: Date;
    metrics: {
        userEngagement: EngagementMetrics;
        contentPerformance: ContentMetrics;
        learningOutcomes: LearningMetrics;
        userRetention: RetentionMetrics;
        responseMetrics: ResponseMetrics;
    }
}

interface EngagementMetrics {
    activeUsers: number;
    averageSessionDuration: number;
    questionAsked: number;
    answersGiven: number;
    lessonViews: number;
}

interface ContentMetrics {
    topPerformingLessons: string[];
    popularTags: string[];
    averageRating: number;
    completionRate: number;
}

interface LearningMetrics {
    quizCompletionRate: number;
    averageScore: number;
    skillProgress: Record<string, number>;
}

interface RetentionMetrics {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    churnRate: number;
}

interface ResponseMetrics {
    averageResponseTime: number;
    resolutionRate: number;
    satisfactionScore: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    criteria: string;
    earnedAt: Date;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    progress: number;
    completedAt?: Date;
    rewards?: string[];
}
