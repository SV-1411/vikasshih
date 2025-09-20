import React, { useState, useEffect } from 'react';
import { Download, Calendar, Clock, Users, Presentation, FileText, ChevronDown, ChevronUp, Mic, Play, Pause } from 'lucide-react';
import { SessionRecorder, SessionRecording } from '../lib/session-recorder';
import { initializeDemoSessions } from '../lib/demo-sessions';
import type { Profile } from '../types';

interface SessionHistoryProps {
  currentUser: Profile;
}

export default function SessionHistory({ currentUser }: SessionHistoryProps) {
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    loadRecordings();
  }, [currentUser.id]);

  const loadRecordings = () => {
    setLoading(true);
    try {
      const userRecordings = SessionRecorder.getUserRecordings(currentUser.id);
      // Sort by date (newest first)
      userRecordings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setRecordings(userRecordings);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReactionCounts = (reactions: any[]) => {
    const counts = { '❤️': 0, '👍': 0, '😊': 0, '🙋': 0, '💬': 0 };
    reactions.forEach(reaction => {
      if (counts.hasOwnProperty(reaction.type)) {
        counts[reaction.type as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const downloadSessionData = (recording: SessionRecording) => {
    SessionRecorder.downloadSessionData(recording);
  };

  const downloadSlides = (recording: SessionRecording) => {
    SessionRecorder.downloadSlides(recording);
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading session history...</p>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="p-8 text-center">
        <Presentation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
        <p className="text-gray-600 mb-6">
          You haven't attended any live slide sessions yet.
          Join a classroom and participate in live sessions to see them here.
        </p>
        <button
          onClick={() => {
            initializeDemoSessions();
            loadRecordings();
            // Also trigger an immediate demo slides download for convenience
            const all = SessionRecorder.getAllRecordings();
            if (all && all.length > 0) {
              SessionRecorder.downloadSlides(all[0]);
            }
          }}
          className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Load Demo Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session History</h2>
        <p className="text-gray-600">
          Download slides and session data from live sessions you've attended
        </p>
      </div>

      <div className="space-y-4">
        {recordings.map((recording) => {
          const isExpanded = expandedSession === recording.id;
          const reactionCounts = getReactionCounts(recording.reactions);
          const userWasHost = recording.hostId === currentUser.id;

          return (
            <div
              key={recording.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Session Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Presentation className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recording.title}
                      </h3>
                      {userWasHost && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          HOST
                        </span>
                      )}
                    </div>
                    {/* Slides preview thumbnails */}
                    {recording.slides && recording.slides.length > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        {recording.slides.slice(0, 3).map((slide, idx) => (
                          <div key={slide.id || idx} className="w-16 h-10 rounded overflow-hidden border">
                            <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {recording.slides.length > 3 && (
                          <span className="text-xs text-gray-500">+{recording.slides.length - 3} more</span>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(recording.startTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(recording.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{recording.participants.length} participants</span>
                      </div>
                      {recording.audioRecording ? (
                        <div className="flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-fuchsia-500" />
                          <span className="text-fuchsia-600 font-medium">Audio included</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>{recording.slides.length} slides</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Host: {recording.hostName}</span>
                      <span>•</span>
                      <span>Classroom: {recording.classroomName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => downloadSlides(recording)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Slides</span>
                    </button>
                    {recording.audioRecording && (
                      <button
                        onClick={() => SessionRecorder.downloadAudio(recording)}
                        className="px-3 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors flex items-center space-x-2"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Audio</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => downloadSessionData(recording)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Data</span>
                    </button>

                    <button
                      onClick={() => toggleExpanded(recording.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Participants */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Participants ({recording.participants.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {recording.participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center justify-between p-2 bg-white rounded border"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                  participant.role === 'teacher' ? 'bg-blue-600' : 
                                  participant.role === 'admin' ? 'bg-purple-600' : 'bg-gray-600'
                                }`}>
                                  {participant.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{participant.name}</p>
                                  <p className="text-sm text-gray-500 capitalize">{participant.role}</p>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(participant.joinTime)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Session Stats */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Session Statistics</h4>
                        <div className="space-y-4">
                          {/* Reactions */}
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Reactions ({recording.reactions.length})</p>
                            <div className="flex items-center space-x-4">
                              {Object.entries(reactionCounts).map(([emoji, count]) => (
                                <div key={emoji} className="flex items-center space-x-1">
                                  <span className="text-lg">{emoji}</span>
                                  <span className="text-sm text-gray-600">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Slide Timings */}
                          {recording.slideTimings.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Slide Duration</p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {recording.slideTimings.map((timing, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>Slide {timing.slideIndex + 1}</span>
                                    <span className="text-gray-500">{timing.duration}s</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Audio Recording */}
                          {recording.audioRecording && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2 flex items-center">
                                <Mic className="w-4 h-4 mr-1" />
                                Lecture Audio ({recording.audioRecording.format.toUpperCase()})
                              </p>
                              <div className="bg-white p-3 rounded-lg border">
                                <audio 
                                  controls 
                                  preload="metadata"
                                  className="w-full"
                                  onPlay={() => setPlayingAudio(recording.id)}
                                  onPause={() => setPlayingAudio(null)}
                                  onEnded={() => setPlayingAudio(null)}
                                >
                                  <source 
                                    src={URL.createObjectURL(recording.audioRecording.blob)} 
                                    type={`audio/${recording.audioRecording.format === 'opus' ? 'webm' : recording.audioRecording.format}`}
                                  />
                                  Your browser does not support the audio element.
                                </audio>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                  <span>Duration: {Math.floor(recording.audioRecording.duration / 60)}:{(recording.audioRecording.duration % 60).toString().padStart(2, '0')}</span>
                                  <span>Size: {(recording.audioRecording.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Download Options */}
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">Download Options</p>
                            <div className="space-y-2">
                              <button
                                onClick={() => downloadSlides(recording)}
                                className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download Slides {recording.audioRecording ? '+ Audio ' : ''}(HTML)</span>
                              </button>
                              {recording.audioRecording && (
                                <button
                                  onClick={() => SessionRecorder.downloadAudio(recording)}
                                  className="w-full px-4 py-2 bg-fuchsia-50 text-fuchsia-700 rounded-lg hover:bg-fuchsia-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Mic className="w-4 h-4" />
                                  <span>Download Audio Only ({recording.audioRecording.format.toUpperCase()})</span>
                                </button>
                              )}
                              <button
                                onClick={() => downloadSessionData(recording)}
                                className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                              >
                                <FileText className="w-4 h-4" />
                                <span>Download Session Data (JSON)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
