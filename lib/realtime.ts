import { getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { create } from 'zustand';

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications],
        })),
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),
    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
}));

export function setupRealtimeListeners(userId: string) {
    const db = getFirestore(getApp());

    // Listen for user's notifications
    const notificationsRef = doc(db, 'users', userId, 'notifications');
    onSnapshot(notificationsRef, (doc) => {
        if (doc.exists()) {
            const notifications = doc.data().items || [];
            useNotificationStore.getState().notifications = notifications;
        }
    });

    // Listen for study group updates
    const studyGroupsRef = doc(db, 'users', userId, 'study_groups');
    onSnapshot(studyGroupsRef, (doc) => {
        if (doc.exists()) {
            // Handle study group updates
            const groups = doc.data().groups || [];
            // Update your study groups state here
        }
    });

    // Listen for achievement updates
    const achievementsRef = doc(db, 'users', userId, 'achievements');
    onSnapshot(achievementsRef, (doc) => {
        if (doc.exists()) {
            // Handle achievement updates
            const achievements = doc.data().items || [];
            // Update your achievements state here
        }
    });

    // Listen for real-time chat messages in study groups
    // This assumes the user is in these study groups
    const userDoc = doc(db, 'users', userId);
    onSnapshot(userDoc, (doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            const groups = userData.studyGroups || [];

            // Set up listeners for each group's chat
            groups.forEach((groupId: string) => {
                const chatRef = doc(db, 'study_groups', groupId, 'chat');
                onSnapshot(chatRef, (chatDoc) => {
                    if (chatDoc.exists()) {
                        // Handle new chat messages
                        const messages = chatDoc.data().messages || [];
                        // Update your chat state here
                    }
                });
            });
        }
    });
}
