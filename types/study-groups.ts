export interface StudyGroupMember {
    id: string;
    name: string;
    role: 'admin' | 'member';
    avatarUrl: string;
    joinedAt: Date;
}

export interface StudyGroup {
    id: string;
    name: string;
    description: string;
    topics: string[];
    members: StudyGroupMember[];
    maxMembers: number;
    visibility: 'public' | 'private';
    meetingSchedule?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: Date;
    editedAt?: Date;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    createdAt: Date;
    read: boolean;
    link?: string;
}
