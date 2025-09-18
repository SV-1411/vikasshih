import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Target, Clock, Star, CheckCircle, Lock } from 'lucide-react';
import { auth } from '../lib/auth';

interface AdaptiveLearningPathProps {
  onBack: () => void;
  onLogout: () => void;
}

interface LearningNode {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  masteryLevel: number;
  estimatedTime: number;
  type: 'concept' | 'practice' | 'assessment';
  prerequisites: string[];
}

export default function AdaptiveLearningPath({ onBack, onLogout }: AdaptiveLearningPathProps) {
  const [currentPath, setCurrentPath] = useState<LearningNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = auth.getCurrentUser();

  useEffect(() => {
    generateAdaptivePath();
  }, []);

  const generateAdaptivePath = async () => {
    // Simulate AI-generated adaptive learning path
    const adaptiveNodes: LearningNode[] = [
      {
        id: 'basics_1',
        title: 'Introduction to Fluids',
        description: 'Learn what fluids are and their basic properties',
        difficulty: 1,
        isUnlocked: true,
        isCompleted: false,
        masteryLevel: 0,
        estimatedTime: 10,
        type: 'concept',
        prerequisites: []
      },
      {
        id: 'basics_2',
        title: 'Fluid Properties Practice',
        description: 'Practice identifying fluid properties',
        difficulty: 2,
        isUnlocked: false,
        isCompleted: false,
        masteryLevel: 0,
        estimatedTime: 15,
        type: 'practice',
        prerequisites: ['basics_1']
      },
      {
        id: 'basics_assessment',
        title: 'Basics Assessment',
        description: 'Test your understanding of fluid basics',
        difficulty: 2,
        isUnlocked: false,
        isCompleted: false,
        masteryLevel: 0,
        estimatedTime: 20,
        type: 'assessment',
        prerequisites: ['basics_1', 'basics_2']
      },
      {
        id: 'intermediate_1',
        title: 'Pressure and Flow',
        description: 'Understanding pressure dynamics in fluids',
        difficulty: 4,
        isUnlocked: false,
        isCompleted: false,
        masteryLevel: 0,
        estimatedTime: 25,
        type: 'concept',
        prerequisites: ['basics_assessment']
      },
      {
        id: 'intermediate_2',
        title: 'Viscosity Deep Dive',
        description: 'Advanced concepts in fluid viscosity',
        difficulty: 5,
        isUnlocked: false,
        isCompleted: false,
        masteryLevel: 0,
        estimatedTime: 30,
        type: 'concept',
        prerequisites: ['intermediate_1']
      }
    ];

    setCurrentPath(adaptiveNodes);
    setLoading(false);
  };

  const handleNodeClick = (node: LearningNode) => {
    if (!node.isUnlocked) return;
    setSelectedNode(node);
  };

  const handleStartLesson = () => {
    if (!selectedNode) return;
    
    // Simulate lesson completion
    const updatedPath = currentPath.map(node => {
      if (node.id === selectedNode.id) {
        const completed = { ...node, isCompleted: true, masteryLevel: 85 };
        
        // Unlock next lessons
        const unlocked = currentPath.map(n => {
          if (n.prerequisites.includes(node.id)) {
            return { ...n, isUnlocked: true };
          }
          return n;
        });
        
        setCurrentPath(unlocked);
        return completed;
      }
      return node;
    });
    
    setCurrentPath(updatedPath);
    setTotalXP(prev => prev + 25);
    setSelectedNode(null);
  };

  const getNodeIcon = (node: LearningNode) => {
    if (!node.isUnlocked) return <Lock size={20} className="text-gray-400" />;
    if (node.isCompleted) return <CheckCircle size={20} className="text-green-500" />;
    if (node.type === 'assessment') return <Target size={20} className="text-purple-500" />;
    if (node.type === 'practice') return <Brain size={20} className="text-blue-500" />;
    return <Star size={20} className="text-yellow-500" />;
  };

  const getNodeColor = (node: LearningNode) => {
    if (!node.isUnlocked) return 'bg-gray-200 border-gray-300';
    if (node.isCompleted) return 'bg-green-100 border-green-300';
    if (node.type === 'assessment') return 'bg-purple-100 border-purple-300';
    if (node.type === 'practice') return 'bg-blue-100 border-blue-300';
    return 'bg-yellow-100 border-yellow-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <button onClick={onLogout} className="text-gray-600 hover:text-gray-800">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Progress Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Adaptive Learning Path</h1>
              <p className="text-gray-600">Personalized just for you, {user?.username}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{totalXP} XP</div>
              <div className="text-sm text-gray-600">Level {userLevel}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-800">Adaptive AI</div>
                  <div className="text-sm text-purple-600">Personalized difficulty</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-800">Spaced Repetition</div>
                  <div className="text-sm text-blue-600">Optimized retention</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Mastery Focus</div>
                  <div className="text-sm text-green-600">85%+ to advance</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Learning Journey</h2>
          
          <div className="space-y-4">
            {currentPath.map((node, index) => (
              <div key={node.id} className="relative">
                {index < currentPath.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300"></div>
                )}
                
                <div
                  onClick={() => handleNodeClick(node)}
                  className={`flex items-start space-x-4 p-4 border-2 rounded-lg transition-all ${
                    node.isUnlocked ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-60'
                  } ${getNodeColor(node)}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-current flex items-center justify-center">
                    {getNodeIcon(node)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{node.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{node.estimatedTime} min</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{node.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Difficulty: {node.difficulty}/10
                        </span>
                        <span className="text-sm text-gray-600 capitalize">
                          {node.type}
                        </span>
                      </div>
                      
                      {node.isCompleted && (
                        <div className="text-sm text-green-600 font-medium">
                          Mastery: {node.masteryLevel}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Modal */}
        {selectedNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getNodeIcon(selectedNode)}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedNode.title}</h3>
                <p className="text-gray-600">{selectedNode.description}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-medium">{selectedNode.estimatedTime} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">{selectedNode.difficulty}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{selectedNode.type}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartLesson}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Start Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}