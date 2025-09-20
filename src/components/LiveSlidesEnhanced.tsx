import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Users,
  Heart,
  ThumbsUp,
  Smile,
  Hand,
  MessageCircle,
  X,
  Play,
  Square,
  Share2,
  Volume2,
  VolumeX,
  Presentation,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { WebRTCAudioManager, AudioParticipant } from '../lib/webrtc-audio';
import { safeLocalStorage, safeCopyToClipboard } from '../lib/error-utils';
import { demoSlides, initializeDemoSlides } from '../lib/demo-slides';
import { SessionRecorder } from '../lib/session-recorder';
import type { Classroom, Profile } from '../types';

interface LiveSlidesEnhancedProps {
  classroom: Classroom;
  currentUser: Profile;
  isHost: boolean;
}

interface Slide {
  id: string;
  url: string;
  title: string;
  type: 'image' | 'pdf';
}

interface Reaction {
  id: string;
  userId: string;
  userName: string;
  type: '❤️' | '👍' | '😊' | '🙋' | '💬';
  timestamp: number;
}

export default function LiveSlidesEnhanced({ classroom, currentUser, isHost }: LiveSlidesEnhancedProps) {
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [shareLink, setShareLink] = useState('');
  
  // Slides state
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Audio state
  const [audioManager, setAudioManager] = useState<WebRTCAudioManager | null>(null);
  const [participants, setParticipants] = useState<AudioParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Recording state
  const [sessionRecorder, setSessionRecorder] = useState<SessionRecorder | null>(null);
  
  // Reactions state
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or join session
  useEffect(() => {
    // Initialize demo slides for this classroom
    initializeDemoSlides(classroom.id);
    
    // Check for active session in localStorage
    const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
    const activeSession = sessions[classroom.id];
    
    if (activeSession) {
      // Load slides (demo or uploaded)
      setSlides(activeSession.slides || demoSlides);
      
      if (activeSession.isActive) {
        setSessionId(activeSession.id);
        setCurrentSlideIndex(activeSession.currentSlide || 0);
        setIsSessionActive(true);
        setShareLink(`${window.location.origin}/join-slides/${activeSession.id}`);
      }
    } else {
      // Load demo slides by default
      setSlides(demoSlides);
    }
  }, [classroom.id]);

  // Poll for slide updates (for viewers)
  useEffect(() => {
    if (!isHost && isSessionActive) {
      const interval = setInterval(() => {
        const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
        const activeSession = sessions[classroom.id];
        
        if (activeSession && activeSession.isActive) {
          setCurrentSlideIndex(activeSession.currentSlide || 0);
          setSlides(activeSession.slides || []);
        }
      }, 1000); // Poll every second
      
      return () => clearInterval(interval);
    }
  }, [isHost, isSessionActive, classroom.id]);

  // Poll for reactions
  useEffect(() => {
    if (isSessionActive) {
      const interval = setInterval(() => {
        const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
        const activeSession = sessions[classroom.id];
        
        if (activeSession && activeSession.reactions) {
          // Keep only recent reactions (last 5 seconds)
          const now = Date.now();
          const recentReactions = activeSession.reactions.filter(
            (r: Reaction) => now - r.timestamp < 5000
          );
          setReactions(recentReactions);
        }
      }, 500); // Poll every 500ms for reactions
      
      return () => clearInterval(interval);
    }
  }, [isSessionActive, classroom.id]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newSlides: Slide[] = [];
    
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const slide: Slide = {
          id: `slide_${Date.now()}_${index}`,
          url: e.target?.result as string,
          title: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 'image'
        };
        newSlides.push(slide);
        
        if (newSlides.length === files.length) {
          setSlides(prev => [...prev, ...newSlides]);
          setIsUploading(false);
          
          // Save to localStorage
          const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
          if (sessions[classroom.id]) {
            sessions[classroom.id].slides = [...slides, ...newSlides];
            safeLocalStorage.setJSON('demo_slide_sessions', sessions);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Start session
  const startSession = async () => {
    const newSessionId = `session_${classroom.id}_${Date.now()}`;
    setSessionId(newSessionId);
    setIsSessionActive(true);
    setShareLink(`${window.location.origin}/join-slides/${newSessionId}`);
    
    // Initialize session recorder
    if (isHost) {
      const recorder = new SessionRecorder(
        newSessionId,
        classroom.id,
        classroom.name,
        currentUser.id,
        currentUser.full_name
      );
      recorder.setSlides(slides);
      recorder.addParticipant({
        id: currentUser.id,
        name: currentUser.full_name,
        role: currentUser.role
      });
      setSessionRecorder(recorder);
    }
    
    // Save session to localStorage
    const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
    sessions[classroom.id] = {
      id: newSessionId,
      isActive: true,
      slides: slides,
      currentSlide: 0,
      startedAt: new Date().toISOString(),
      hostId: currentUser.id,
      hostName: currentUser.full_name,
      reactions: []
    };
    safeLocalStorage.setJSON('demo_slide_sessions', sessions);
    
    // Initialize audio
    if (WebRTCAudioManager.isSupported()) {
      const manager = new WebRTCAudioManager(
        newSessionId,
        currentUser.id,
        currentUser.full_name,
        currentUser.role as 'teacher' | 'student' | 'admin'
      );
      
      manager.onParticipantsChanged((newParticipants) => {
        setParticipants(newParticipants);
        
        // Update recorder with participants
        if (sessionRecorder) {
          newParticipants.forEach(p => {
            if (!participants.find(existing => existing.id === p.id)) {
              sessionRecorder.addParticipant({
                id: p.id,
                name: p.name,
                role: p.role
              });
            }
          });
        }
      });
      
      const audioInitialized = await manager.initializeAudio();
      if (audioInitialized) {
        await manager.joinRoom();
        setAudioEnabled(true);
      }
      
      setAudioManager(manager);
    }
  };

  // End session
  const endSession = async () => {
    // Save recording if host
    if (sessionRecorder && isHost) {
      const recording = sessionRecorder.endRecording();
      console.log('📹 Session recorded and saved:', recording.id);
    }
    
    setIsSessionActive(false);
    setSessionRecorder(null);
    
    // Clear session from localStorage
    const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
    if (sessions[classroom.id]) {
      sessions[classroom.id].isActive = false;
      safeLocalStorage.setJSON('demo_slide_sessions', sessions);
    }
    
    // Leave audio room
    if (audioManager) {
      await audioManager.leaveRoom();
      setAudioManager(null);
      setAudioEnabled(false);
    }
    
    setParticipants([]);
  };

  // Navigate slides
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      // Record slide change if recording
      if (sessionRecorder && isHost) {
        sessionRecorder.recordSlideChange(index);
      }
      
      setCurrentSlideIndex(index);
      
      // Update in localStorage for viewers
      const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
      if (sessions[classroom.id]) {
        sessions[classroom.id].currentSlide = index;
        safeLocalStorage.setJSON('demo_slide_sessions', sessions);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioManager) {
      const newMuteState = audioManager.toggleMute();
      setIsMuted(newMuteState);
    }
  };

  // Send reaction
  const sendReaction = (type: '❤️' | '👍' | '😊' | '🙋' | '💬') => {
    const reaction: Reaction = {
      id: `reaction_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.full_name,
      type,
      timestamp: Date.now()
    };
    
    // Record reaction if recording
    if (sessionRecorder) {
      sessionRecorder.recordReaction(reaction);
    }
    
    // Save to localStorage
    const sessions = safeLocalStorage.getJSON<any>('demo_slide_sessions', {});
    if (sessions[classroom.id]) {
      if (!sessions[classroom.id].reactions) {
        sessions[classroom.id].reactions = [];
      }
      sessions[classroom.id].reactions.push(reaction);
      
      // Keep only last 20 reactions
      if (sessions[classroom.id].reactions.length > 20) {
        sessions[classroom.id].reactions = sessions[classroom.id].reactions.slice(-20);
      }
      
      safeLocalStorage.setJSON('demo_slide_sessions', sessions);
    }
    
    setShowReactionMenu(false);
  };

  // Copy share link
  const copyShareLink = async () => {
    await safeCopyToClipboard(shareLink);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Presentation className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              Live Slides - {classroom.name}
            </h2>
            {isSessionActive && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {isSessionActive && shareLink && (
              <button
                onClick={copyShareLink}
                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            )}
            
            {isHost && !isSessionActive && slides.length > 0 && (
              <button
                onClick={startSession}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Session</span>
              </button>
            )}
            
            {isHost && isSessionActive && (
              <button
                onClick={endSession}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Square className="w-4 h-4" />
                <span>End Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Slide Area */}
        <div className="flex-1 flex flex-col">
          {/* Slide Display */}
          <div className="flex-1 relative bg-black flex items-center justify-center p-8">
            {slides.length > 0 ? (
              <>
                <img
                  src={slides[currentSlideIndex]?.url}
                  alt={slides[currentSlideIndex]?.title}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Slide Navigation */}
                {isHost && (
                  <>
                    <button
                      onClick={() => goToSlide(currentSlideIndex - 1)}
                      disabled={currentSlideIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={() => goToSlide(currentSlideIndex + 1)}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Slide Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
                  {currentSlideIndex + 1} / {slides.length}
                </div>
                
                {/* Reactions Display */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-wrap gap-2">
                  {reactions.map(reaction => (
                    <div
                      key={reaction.id}
                      className="animate-float-up px-3 py-1 bg-white/10 backdrop-blur rounded-full flex items-center space-x-2"
                    >
                      <span className="text-2xl">{reaction.type}</span>
                      <span className="text-white text-sm">{reaction.userName}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                {isHost ? (
                  <>
                    <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No slides uploaded yet</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Slides'}
                    </button>
                  </>
                ) : (
                  <>
                    <Presentation className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Waiting for host to upload slides...</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Audio Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleMute}
                  disabled={!audioEnabled}
                  className={`p-3 rounded-lg transition-colors ${
                    isMuted 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                {!audioEnabled && (
                  <span className="text-sm text-gray-500">Audio not available</span>
                )}
              </div>

              {/* Reactions */}
              <div className="relative">
                <button
                  onClick={() => setShowReactionMenu(!showReactionMenu)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <Smile className="w-5 h-5" />
                  <span>React</span>
                </button>
                
                {showReactionMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-gray-700 rounded-lg p-2 flex space-x-2">
                    {(['❤️', '👍', '😊', '🙋', '💬'] as const).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(emoji)}
                        className="p-2 hover:bg-gray-600 rounded transition-colors text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload More (Host only) */}
              {isHost && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{isUploading ? 'Uploading...' : 'Add Slides'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        {isSessionActive && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Participants ({participants.length})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      participant.role === 'teacher' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{participant.name}</p>
                      <p className="text-gray-400 text-sm capitalize">{participant.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {participant.isSpeaking && (
                      <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />
                    )}
                    {participant.isMuted && (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Thumbnails */}
            {slides.length > 0 && (
              <div className="border-t border-gray-700 p-4">
                <h4 className="text-white text-sm font-semibold mb-3">Slides</h4>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => isHost && goToSlide(index)}
                      disabled={!isHost}
                      className={`relative aspect-video bg-gray-700 rounded overflow-hidden border-2 transition-all ${
                        index === currentSlideIndex 
                          ? 'border-blue-500' 
                          : 'border-transparent hover:border-gray-600'
                      } ${!isHost && 'cursor-default'}`}
                    >
                      <img
                        src={slide.url}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-1">
                        {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }
        
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
