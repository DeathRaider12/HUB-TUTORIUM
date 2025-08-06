import { Progress } from './progress';
import { Badge } from './badge';

interface ProgressTrackingProps {
    achievements: {
        id: string;
        name: string;
        description: string;
        progress: number;
        total: number;
    }[];
    level: number;
    experience: number;
    nextLevelExperience: number;
    badges: {
        id: string;
        name: string;
        imageUrl: string;
    }[];
}

export function ProgressTracking({
    achievements,
    level,
    experience,
    nextLevelExperience,
    badges,
}: ProgressTrackingProps) {
    const experienceProgress = (experience / nextLevelExperience) * 100;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-2">Level Progress</h3>
                <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold">Level {level}</span>
                    <Progress value={experienceProgress} />
                    <span className="text-sm text-gray-500">
                        {experience}/{nextLevelExperience} XP
                    </span>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-2">Achievements</h3>
                <div className="space-y-4">
                    {achievements.map((achievement) => (
                        <div key={achievement.id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{achievement.name}</h4>
                                <span className="text-sm text-gray-500">
                                    {achievement.progress}/{achievement.total}
                                </span>
                            </div>
                            <Progress
                                value={(achievement.progress / achievement.total) * 100}
                                className="mb-2"
                            />
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-2">Earned Badges</h3>
                <div className="flex flex-wrap gap-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <img
                                src={badge.imageUrl}
                                alt={badge.name}
                                className="w-12 h-12 mb-2"
                            />
                            <Badge variant="secondary">{badge.name}</Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
