import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card } from './card';
import { Label } from './label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './dialog';
import { Plus, X } from 'lucide-react';

interface CreateStudyGroupFormProps {
    onSubmit: (data: {
        name: string;
        description: string;
        topics: string[];
        maxMembers: number;
        meetingSchedule?: string;
    }) => void;
}

export function CreateStudyGroupForm({ onSubmit }: CreateStudyGroupFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [topic, setTopic] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [maxMembers, setMaxMembers] = useState(50);
    const [meetingSchedule, setMeetingSchedule] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            description,
            topics,
            maxMembers,
            meetingSchedule: meetingSchedule || undefined,
        });
        setIsOpen(false);
        resetForm();
    };

    const addTopic = () => {
        if (topic.trim() && !topics.includes(topic.trim())) {
            setTopics([...topics, topic.trim()]);
            setTopic('');
        }
    };

    const removeTopic = (topicToRemove: string) => {
        setTopics(topics.filter((t) => t !== topicToRemove));
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setTopic('');
        setTopics([]);
        setMaxMembers(50);
        setMeetingSchedule('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Study Group
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create a New Study Group</DialogTitle>
                    <DialogDescription>
                        Create a space for collaborative learning and discussion.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={3}
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            minLength={10}
                            maxLength={500}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Topics</Label>
                        <div className="flex gap-2">
                            <Input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Add a topic"
                                className="flex-1"
                            />
                            <Button type="button" onClick={addTopic}>
                                Add
                            </Button>
                        </div>
                        {topics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {topics.map((t) => (
                                    <Card
                                        key={t}
                                        className="px-3 py-1 flex items-center gap-2 bg-blue-50"
                                    >
                                        <span className="text-sm">{t}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTopic(t)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxMembers">Maximum Members</Label>
                        <Input
                            id="maxMembers"
                            type="number"
                            value={maxMembers}
                            onChange={(e) => setMaxMembers(Number(e.target.value))}
                            required
                            min={2}
                            max={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meetingSchedule">Meeting Schedule (Optional)</Label>
                        <Input
                            id="meetingSchedule"
                            value={meetingSchedule}
                            onChange={(e) => setMeetingSchedule(e.target.value)}
                            placeholder="e.g., Every Monday at 3 PM UTC"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Group</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
