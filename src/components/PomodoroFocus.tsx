import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Coffee, Brain, Zap, Settings, X, Volume2, VolumeX } from 'lucide-react';
import { auth } from '../lib/auth';

interface PomodoroFocusProps {
  onBack: () => void;
  onLogout: () => void;
}

interface PomodoroSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  type: 'focus' | 'short_break' | 'long_break';
  completed: boolean;
}

const breakMemes = [
  {
    text: "Time for a break! 🎉",
    subtitle: "Your brain needs some rest!",
    emoji: "🧠💤"
  },
  {
    text: "Break time! 🚀",
    subtitle: "You've earned it, champion!",
    emoji: "🏆✨"
  },
  {
    text: "Stretch break! 🤸‍♂️",
    subtitle: "Move those muscles!",
    emoji: "💪🔥"
  },
  {
    text: "Hydration station! 💧",
    subtitle: "Drink some water, you beautiful human!",
    emoji: "🚰😊"
  },
  {
    text: "Snack attack! 🍎",
    subtitle: "Fuel your amazing brain!",
    emoji: "🧠⚡"
  },
  {
    text: "Fresh air time! 🌬️",
    subtitle: "Take a deep breath!",
    emoji: "🌱🌟"
  }
];

const motivationalMessages = [
  "You're doing amazing! 🌟",
  "Focus mode: ACTIVATED! 🚀",
  "Learning machine ON! 🤖",
  "Brain gains incoming! 💪",
  "Knowledge level: RISING! 📈",
  "Study warrior mode! ⚔️"
];

export default function PomodoroFocus({ onBack, onLogout }: PomodoroFocusProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentMeme, setCurrentMeme] = useState(breakMemes[0]);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  
  const [settings, setSettings] = useState<PomodoroSettings>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    notificationsEnabled: true
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = auth.getCurrentUser();

  useEffect(() => {
    loadUserStats();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const loadUserStats = () => {
    if (!user) return;
    
    const stats = localStorage.getItem(`pomodoro_stats_${user.id}`);
    if (stats) {
      const parsed = JSON.parse(stats);
      setTotalFocusTime(parsed.totalFocusTime || 0);
      setDailyStreak(parsed.dailyStreak || 0);
    }
  };

  const saveUserStats = () => {
    if (!user) return;
    
    const stats = {
      totalFocusTime,
      dailyStreak,
      lastSession: new Date().toISOString()
    };
    localStorage.setItem(`pomodoro_stats_${user.id}`, JSON.stringify(stats));
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (currentSession === 'focus') {
      setTotalFocusTime(prev => prev + settings.focusDuration);
      setSessionCount(prev => prev + 1);
      
      // Determine next session type
      const nextSessionType = sessionCount + 1 >= settings.sessionsUntilLongBreak ? 'long_break' : 'short_break';
      setCurrentSession(nextSessionType);
      
      if (nextSessionType === 'long_break') {
        setTimeLeft(settings.longBreakDuration * 60);
        setSessionCount(0);
      } else {
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      
      showBreakNotification();
    } else {
      // Break completed, back to focus
      setCurrentSession('focus');
      setTimeLeft(settings.focusDuration * 60);
      showFocusNotification();
    }
    
    saveUserStats();
    playNotificationSound();
  };

  const showBreakNotification = () => {
    if (!settings.notificationsEnabled) return;
    
    const randomMeme = breakMemes[Math.floor(Math.random() * breakMemes.length)];
    setCurrentMeme(randomMeme);
    setShowNotification(true);
    
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const showFocusNotification = () => {
    if (!settings.notificationsEnabled) return;
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setCurrentMeme({
      text: "Back to focus! 🎯",
      subtitle: randomMessage,
      emoji: "🔥💪"
    });
    setShowNotification(true);
    
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const playNotificationSound = () => {
    if (!settings.soundEnabled) return;
    
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const startTimer = () => {
    setIsActive(true);
    if (currentSession === 'focus') {
      setDailyStreak(prev => prev + 1);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (currentSession === 'focus') {
      setTimeLeft(settings.focusDuration * 60);
    } else if (currentSession === 'short_break') {
      setTimeLeft(settings.shortBreakDuration * 60);
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'focus': return 'from-blue-500 to-purple-600';
      case 'short_break': return 'from-green-500 to-teal-600';
      case 'long_break': return 'from-orange-500 to-red-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'focus': return <Brain size={32} />;
      case 'short_break': return <Coffee size={32} />;
      case 'long_break': return <Zap size={32} />;
      default: return <Brain size={32} />;
    }
  };

  const getSessionTitle = () => {
    switch (currentSession) {
      case 'focus': return 'Focus Time';
      case 'short_break': return 'Short Break';
      case 'long_break': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg"
            >
              <Settings size={20} />
            </button>
            <button onClick={onLogout} className="text-gray-600 hover:text-gray-800">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Timer className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
                <div className="text-sm text-gray-600">Total Focus Time</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{dailyStreak}</div>
                <div className="text-sm text-gray-600">Daily Streak</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{sessionCount}</div>
                <div className="text-sm text-gray-600">Sessions Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Timer */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${getSessionColor()} text-white mb-6`}>
              {getSessionIcon()}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{getSessionTitle()}</h2>
            <p className="text-gray-600 mb-8">
              {currentSession === 'focus' 
                ? 'Time to focus and learn!' 
                : 'Take a well-deserved break!'}
            </p>
            
            <div className="text-8xl font-mono font-bold text-gray-800 mb-8">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              {!isActive ? (
                <button
                  onClick={startTimer}
                  className={`flex items-center space-x-2 px-8 py-4 bg-gradient-to-r ${getSessionColor()} text-white rounded-xl hover:shadow-lg transition-all text-lg font-semibold`}
                >
                  <Play size={24} />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center space-x-2 px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all text-lg font-semibold"
                >
                  <Pause size={24} />
                  <span>Pause</span>
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="flex items-center space-x-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Session Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Progress</h3>
          <div className="flex items-center space-x-2">
            {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index < sessionCount
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
            <div className="ml-4 text-sm text-gray-600">
              {sessionCount}/{settings.sessionsUntilLongBreak} sessions until long break
            </div>
          </div>
        </div>
      </div>

      {/* Fun Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-bounce">
            <button
              onClick={() => setShowNotification(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-6xl mb-4">{currentMeme.emoji}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentMeme.text}</h3>
            <p className="text-gray-600 mb-6">{currentMeme.subtitle}</p>
            
            <button
              onClick={() => setShowNotification(false)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Got it! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Pomodoro Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.focusDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, focusDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                  max="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                  max="60"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sound Notifications</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  className={`p-2 rounded-lg ${settings.soundEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Fun Notifications</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.notificationsEnabled ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  resetTimer();
                }}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}