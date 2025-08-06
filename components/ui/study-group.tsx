import { FC, useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { Textarea } from './textarea';

export interface StudyGroup {
    id: string;
    name: string;
    description: string;
    members: string[];
    createdAt: Date;
    createdBy: string;
    subject: string;
    tags: string[];
}

interface StudyGroupProps {
    group: StudyGroup;
    onJoin: (groupId: string) => void;
    onLeave: (groupId: string) => void;
    onSelect: () => void;
    isSelected: boolean;
    isMember: boolean;
}

export const StudyGroup: FC<StudyGroupProps> = ({
    group,
    onJoin,
    onLeave,
    onSelect,
    isSelected,
    isMember,
}) => {
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
                        {group.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                {!isMember ? (
                    <Button onClick={() => onJoin(group.id)}>Join Group</Button>
                ) : (
                    <Button variant="outline" onClick={() => onLeave(group.id)}>
                        Leave Group
                    </Button>
                )}
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Members ({group.members.length})</h3>
                <div className="flex flex-wrap gap-4">
                    {group.members.map((member) => (
                        <div key={member} className="flex items-center gap-2">
                            <img
                                src={`https://ui-avatars.com/api/?name=${member}&size=32`}
                                alt={member}
                                className="w-8 h-8 rounded-full"
                            />
                            <div>
                                <p className="font-medium">{member}</p>
                                <p className="text-xs text-gray-500 capitalize">Member</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
};

function onPost(message: string) {
    throw new Error('Function not implemented.');
}
