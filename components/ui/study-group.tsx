import { useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { Textarea } from './textarea';

interface StudyGroup {
    id: string;
    name: string;
    description: string;
    members: {
        id: string;
        name: string;
        role: 'admin' | 'member';
        avatarUrl: string;
    }[];
    topics: string[];
    meetingSchedule?: string;
}

interface StudyGroupProps {
    group: StudyGroup;
    onJoin?: () => void;
    onLeave?: () => void;
    onPost?: (message: string) => void;
    isMember: boolean;
}

export function StudyGroup({
    group,
    onJoin,
    onLeave,
    onSelect,
    isSelected,
    isMember,
}: StudyGroupProps & {
    onSelect: () => void;
    isSelected: boolean;
}) {
    const handleClick = () => {
        onSelect();
        const [message, setMessage] = useState('');

        const handlePost = () => {
            if (!message.trim()) return;
            onPost?.(message);
            setMessage('');
        };

        return (
            <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
                        <p className="text-gray-600 mb-4">{group.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {group.topics.map((topic) => (
                                <span
                                    key={topic}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                    {!isMember ? (
                        <Button onClick={onJoin}>Join Group</Button>
                    ) : (
                        <Button variant="outline" onClick={onLeave}>
                            Leave Group
                        </Button>
                    )}
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Members ({group.members.length})</h3>
                    <div className="flex flex-wrap gap-4">
                        {group.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-2">
                                <img
                                    src={member.avatarUrl}
                                    alt={member.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {group.meetingSchedule && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Next Meeting</h3>
                        <p className="text-gray-600">{group.meetingSchedule}</p>
                    </div>
                )}

                {isMember && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Discussion</h3>
                        <div className="flex gap-2">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Share your thoughts with the group..."
                                className="flex-1"
                            />
                            <Button onClick={handlePost}>Post</Button>
                        </div>
                    </div>
                )}
            </Card>
        );
    }
    function onPost(message: string) {
        throw new Error('Function not implemented.');
    }
}
