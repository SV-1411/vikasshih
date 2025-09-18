import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, BookOpen, Headphones } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import QuizEngine from './QuizEngine';
import { Lesson, Activity, ProgressEvent } from '../types';
import { db } from '../lib/database';
import { auth } from '../lib/auth';
import { v4 as uuidv4 } from 'uuid';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
}

export default function LessonView({ lesson, onBack, onComplete }: LessonViewProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentStep, setCurrentStep] = useState<'content' | 'quiz'>('content');
  const [showTranscript, setShowTranscript] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [lesson.id]);

  const loadActivities = async () => {
    try {
      const lessonActivities = await db.getActivitiesByLesson(lesson.id);
      setActivities(lessonActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = () => {
    saveProgress('completed', 100);
    if (activities.length > 0) {
      setCurrentStep('quiz');
    } else {
      onComplete();
    }
  };

  const handleQuizComplete = async (score: number, answers: Record<number, any>) => {
    await saveProgress('completed', score, answers);
    onComplete();
  };

  const saveProgress = async (status: ProgressEvent['status'], score?: number, data?: any) => {
    const user = auth.getCurrentUser();
    if (!user) return;

    const progress: ProgressEvent = {
      _id: `progress_${uuidv4()}`,
      id: uuidv4(),
      user_id: user.id,
      lesson_id: lesson.id,
      timestamp: new Date().toISOString(),
      status,
      score,
      attempts: 1,
      data
    };

    try {
      await db.saveProgress(progress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const addBookmark = (time: number) => {
    setBookmarks(prev => [...prev, time].sort((a, b) => a - b));
  };

  const downloadForOffline = () => {
    // In a real app, this would download the media file to local storage
    console.log('Downloading lesson for offline access...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'quiz' && activities.length > 0) {
    const quizActivities = activities.filter(a => a.type === 'quiz');
    const exercises = quizActivities.map(a => a.schema);
    
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setCurrentStep('content')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} />
              <span>Back to lesson</span>
            </button>
          </div>
          
          <QuizEngine 
            exercises={exercises}
            onComplete={handleQuizComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                showTranscript ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <BookOpen size={16} />
              <span>Transcript</span>
            </button>
            
            <button
              onClick={downloadForOffline}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
            >
              <Download size={16} />
              <span>Save Offline</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Headphones size={16} />
              <span>{lesson.duration ? Math.ceil(lesson.duration / 60) : '~5'} min</span>
            </div>
            {lesson.size && (
              <span>{Math.round(lesson.size / 1024 / 1024 * 10) / 10} MB</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {lesson.type === 'audio' && (
              <div className="mb-8">
                <AudioPlayer
                  src={lesson.content_ref}
                  title={lesson.title}
                  bookmarks={bookmarks}
                  onAddBookmark={addBookmark}
                  onComplete={handleLessonComplete}
                />
              </div>
            )}

            {lesson.type === 'video' && (
              <div className="mb-8">
                <video
                  controls
                  className="w-full rounded-lg shadow-lg"
                  onEnded={handleLessonComplete}
                >
                  <source src={lesson.content_ref} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {lesson.type === 'text' && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content_ref }} />
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleLessonComplete}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}

            {activities.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('quiz')}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-lg font-semibold"
                >
                  Take Quiz ({activities.length} questions)
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showTranscript && lesson.transcript && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold mb-3">Transcript</h3>
                <div className="text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
                  {lesson.transcript}
                </div>
              </div>
            )}

            {bookmarks.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold mb-3">Bookmarks</h3>
                <div className="space-y-2">
                  {bookmarks.map((bookmark, index) => (
                    <button
                      key={index}
                      className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                    >
                      {Math.floor(bookmark / 60)}:{Math.floor(bookmark % 60).toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold mb-3">Lesson Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Type: {lesson.type}</div>
                {lesson.duration && (
                  <div>Duration: {Math.ceil(lesson.duration / 60)} minutes</div>
                )}
                {lesson.size && (
                  <div>Size: {Math.round(lesson.size / 1024 / 1024 * 10) / 10} MB</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}