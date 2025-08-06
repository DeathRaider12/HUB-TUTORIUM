'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';

import { StudyGroupChat } from '@/components/ui/study-group-chat';
import { CreateStudyGroupForm } from '@/components/ui/create-study-group-form';
import { StudyGroup } from '@/components/ui/study-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type {  ChatMessage } from '@/types/study-groups';
import { useToast } from '@/components/ui/use-toast';

export default function StudyGroupsPage() {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const { user } = useAuth();
    const { toast } = useToast();
    const db = getFirestore();

    // Fetch study groups
    useEffect(() => {
        const fetchGroups = async () => {
            const querySnapshot = await getDocs(collection(db, 'study_groups'));
            const groupsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate()
            })) as StudyGroup[];
            setGroups(groupsData);
        };

        fetchGroups();
    }, [db]);

    // Listen to chat messages when a group is selected
    useEffect(() => {
        if (!selectedGroup) return;

        const unsubscribe = onSnapshot(
            collection(db, 'study_groups', selectedGroup, 'messages'),
            (snapshot) => {
                const newMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate()
                })) as ChatMessage[];

                setMessages(newMessages.sort((a, b) =>
                    a.createdAt.getTime() - b.createdAt.getTime()
                ));
            }
        );

        return () => unsubscribe();
    }, [selectedGroup, db]);

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleJoin = async (groupId: string) => {
        if (!user) return;

        const groupRef = doc(db, 'study_groups', groupId);
        const memberData = {
            id: user.uid,
            name: user.displayName || 'Anonymous',
            role: 'member' as const,
            avatarUrl: user.photoURL || '',
            joinedAt: new Date()
        };

        try {
            await updateDoc(groupRef, {
                members: arrayUnion(memberData)
            });

            toast({
                title: "Joined successfully",
                description: "You are now a member of this study group",
            });

            // Update local state
            setGroups(groups.map(group =>
                group.id === groupId
                    ? { ...group, members: [...group.members, memberData] }
                    : group
            ));
        } catch (error) {
            toast({
                title: "Error joining group",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    const handleLeave = async (groupId: string) => {
        if (!user) return;

        const groupRef = doc(db, 'study_groups', groupId);
        try {
            await updateDoc(groupRef, {
                members: arrayRemove({ id: user.uid })
            });

            toast({
                title: "Left successfully",
                description: "You have left the study group",
            });

            // Update local state
            setGroups(groups.map(group =>
                group.id === groupId
                    ? { ...group, members: group.members.filter(m => m.id !== user.uid) }
                    : group
            ));

            if (selectedGroup === groupId) {
                setSelectedGroup(null);
            }
        } catch (error) {
            toast({
                title: "Error leaving group",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    const handleCreateGroup = async (data: {
        name: string;
        description: string;
        topics: string[];
        maxMembers: number;
        meetingSchedule?: string;
    }) => {
        if (!user) return;

        const newGroup = {
            ...data,
            members: [{
                id: user.uid,
                name: user.displayName || 'Anonymous',
                role: 'admin' as const,
                avatarUrl: user.photoURL || '',
                joinedAt: new Date()
            }],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            visibility: 'public' as const
        };

        try {
            const docRef = await addDoc(collection(db, 'study_groups'), newGroup);

            toast({
                title: "Group created successfully",
                description: "Your study group is now ready",
            });
            

            // Update local state
            setGroups([...groups, { ...newGroup, id: docRef.id }]);
        } catch (error) {
            toast({
                title: "Error creating group",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!user || !selectedGroup) return;

        try {
            await addDoc(collection(db, 'study_groups', selectedGroup, 'messages'), {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userAvatar: user.photoURL || '',
                content: message,
                createdAt: Timestamp.now()
            });
        } catch (error) {
            toast({
                title: "Error sending message",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Study Groups</h1>
                <CreateStudyGroupForm onSubmit={handleCreateGroup} />
            </div>

            <div className="mb-6">
                <Input
                    type="search"
                    placeholder="Search groups by name, description, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {filteredGroups.map((group) => (
                        <StudyGroupComponent
                            key={group.id}
                            group={group}
                            onJoin={() => handleJoin(group.id)}
                            onLeave={() => handleLeave(group.id)}
                            onSelect={() => setSelectedGroup(group.id)}
                            isSelected={selectedGroup === group.id}
                            isMember={group.members.some(member => member.id === user?.uid)}
                        />
                    ))}
                    {filteredGroups.length === 0 && (
                        <p className="text-center text-gray-500">
                            No study groups found matching your search.
                        </p>
                    )}
                </div>

                <div className="sticky top-24">
                    {selectedGroup ? (
                        <StudyGroupChat
                            groupId={selectedGroup}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <div className="h-[600px] flex items-center justify-center border rounded-lg bg-gray-50">
                            <p className="text-gray-500">Select a group to view the chat</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
