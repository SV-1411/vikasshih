import React from 'react';
import { Lock, Star, CheckCircle } from 'lucide-react';
import { Course, UserProgress } from '../types';

interface SkillNode {
  id: string;
  title: string;
  level: number;
  xp: number;
  maxXp: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  position: { x: number; y: number };
}

interface SkillTreeProps {
  course: Course;
  userProgress: UserProgress;
  onNodeClick: (nodeId: string) => void;
}

export default function SkillTree({ course, userProgress, onNodeClick }: SkillTreeProps) {
  // Mock skill nodes - in real app, this would be derived from course modules
  const skillNodes: SkillNode[] = [
    {
      id: 'basics',
      title: 'Basics',
      level: Math.min(userProgress.skill_levels?.['basics'] || 0, 5),
      xp: Math.min(userProgress.total_xp, 200),
      maxXp: 200,
      isUnlocked: true,
      isCompleted: userProgress.total_xp >= 200,
      position: { x: 50, y: 80 }
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      level: Math.min(userProgress.skill_levels?.['intermediate'] || 0, 5),
      xp: Math.max(0, userProgress.total_xp - 200),
      maxXp: 200,
      isUnlocked: userProgress.total_xp >= 100,
      isCompleted: userProgress.total_xp >= 400,
      position: { x: 50, y: 60 }
    },
    {
      id: 'advanced',
      title: 'Advanced',
      level: Math.min(userProgress.skill_levels?.['advanced'] || 0, 5),
      xp: Math.max(0, userProgress.total_xp - 400),
      maxXp: 200,
      isUnlocked: userProgress.total_xp >= 300,
      isCompleted: userProgress.total_xp >= 600,
      position: { x: 25, y: 40 }
    },
    {
      id: 'expert',
      title: 'Expert',
      level: Math.min(userProgress.skill_levels?.['expert'] || 0, 5),
      xp: Math.max(0, userProgress.total_xp - 400),
      maxXp: 200,
      isUnlocked: userProgress.total_xp >= 300,
      isCompleted: userProgress.total_xp >= 600,
      position: { x: 75, y: 40 }
    },
    {
      id: 'master',
      title: 'Master',
      level: Math.min(userProgress.skill_levels?.['master'] || 0, 5),
      xp: Math.max(0, userProgress.total_xp - 600),
      maxXp: 300,
      isUnlocked: userProgress.total_xp >= 500,
      isCompleted: userProgress.total_xp >= 900,
      position: { x: 50, y: 20 }
    }
  ];

  const getNodeColor = (node: SkillNode) => {
    if (!node.isUnlocked) return 'bg-gray-300';
    if (node.isCompleted) return 'bg-green-500';
    if (node.level > 0) return 'bg-blue-500';
    return 'bg-blue-300';
  };

  const getNodeIcon = (node: SkillNode) => {
    if (!node.isUnlocked) return <Lock size={20} className="text-gray-600" />;
    if (node.isCompleted) return <CheckCircle size={20} className="text-white" />;
    if (node.level >= 3) return <Star size={20} className="text-white" />;
    return <div className={`w-6 h-6 rounded-full border-2 border-white text-white text-sm font-bold flex items-center justify-center`}>{node.level}</div>;
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Star size={16} className="text-yellow-500" />
            <span>Level {userProgress.current_level}</span>
          </div>
          <div>Total XP: {userProgress.total_xp}</div>
          <div>Streak: {userProgress.streak_days} days</div>
        </div>
      </div>

      <div className="relative h-96 bg-gradient-to-t from-green-100 to-blue-100 rounded-lg">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Draw connections between nodes */}
          <path
            d="M 50% 80% L 50% 60%"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="5,5"
            fill="none"
          />
          <path
            d="M 50% 60% L 25% 40%"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="5,5"
            fill="none"
          />
          <path
            d="M 50% 60% L 75% 40%"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="5,5"
            fill="none"
          />
          <path
            d="M 25% 40% L 50% 20%"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="5,5"
            fill="none"
          />
          <path
            d="M 75% 40% L 50% 20%"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="5,5"
            fill="none"
          />
        </svg>

        {/* Skill nodes */}
        {skillNodes.map((node) => (
          <button
            key={node.id}
            onClick={() => node.isUnlocked && onNodeClick(node.id)}
            disabled={!node.isUnlocked}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getNodeColor(node)} w-16 h-16 rounded-full shadow-lg border-4 border-white hover:scale-110 transition-all duration-200 flex flex-col items-center justify-center ${
              node.isUnlocked ? 'cursor-pointer hover:shadow-xl' : 'cursor-not-allowed opacity-60'
            }`}
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`
            }}
          >
            {getNodeIcon(node)}
          </button>
        ))}

        {/* Node labels */}
        {skillNodes.map((node) => (
          <div
            key={`label-${node.id}`}
            className="absolute transform -translate-x-1/2 translate-y-8 text-center"
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`
            }}
          >
            <div className="text-sm font-semibold text-gray-800">{node.title}</div>
            {node.isUnlocked && (
              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(node.xp / node.maxXp) * 100}%` }}
                />
              </div>
            )}
            <div className="text-xs text-gray-600">{node.xp}/{node.maxXp} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}