/**
 * Session Recording System for Live Slides
 * Records completed sessions for later download by students
 */

import { safeLocalStorage } from './error-utils';

export interface SessionRecording {
  id: string;
  classroomId: string;
  classroomName: string;
  title: string;
  hostId: string;
  hostName: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  slides: Array<{
    id: string;
    title: string;
    url: string;
    type: 'image' | 'pdf';
  }>;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    joinTime: string;
    leaveTime?: string;
  }>;
  reactions: Array<{
    id: string;
    userId: string;
    userName: string;
    type: string;
    timestamp: number;
    slideIndex: number;
  }>;
  slideTimings: Array<{
    slideIndex: number;
    timestamp: number;
    duration: number; // seconds spent on this slide
  }>;
}

export class SessionRecorder {
  private sessionId: string;
  private classroomId: string;
  private classroomName: string;
  private hostId: string;
  private hostName: string;
  private startTime: Date;
  private slides: any[] = [];
  private participants: Map<string, any> = new Map();
  private reactions: any[] = [];
  private slideTimings: Array<{ slideIndex: number; timestamp: number; duration: number }> = [];
  private currentSlideIndex: number = 0;
  private currentSlideStartTime: number = Date.now();

  constructor(
    sessionId: string,
    classroomId: string,
    classroomName: string,
    hostId: string,
    hostName: string
  ) {
    this.sessionId = sessionId;
    this.classroomId = classroomId;
    this.classroomName = classroomName;
    this.hostId = hostId;
    this.hostName = hostName;
    this.startTime = new Date();
    
    console.log('📹 Session recording started:', sessionId);
  }

  /**
   * Set slides for the session
   */
  setSlides(slides: any[]) {
    this.slides = slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      url: slide.url,
      type: slide.type
    }));
  }

  /**
   * Record participant joining
   */
  addParticipant(participant: { id: string; name: string; role: string }) {
    this.participants.set(participant.id, {
      ...participant,
      joinTime: new Date().toISOString()
    });
    console.log('👤 Participant joined recording:', participant.name);
  }

  /**
   * Record participant leaving
   */
  removeParticipant(participantId: string) {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.leaveTime = new Date().toISOString();
      console.log('👋 Participant left recording:', participant.name);
    }
  }

  /**
   * Record slide navigation
   */
  recordSlideChange(newSlideIndex: number) {
    const now = Date.now();
    const duration = Math.round((now - this.currentSlideStartTime) / 1000);
    
    // Record time spent on previous slide
    if (this.slideTimings.length > 0 || this.currentSlideIndex > 0) {
      this.slideTimings.push({
        slideIndex: this.currentSlideIndex,
        timestamp: this.currentSlideStartTime,
        duration: duration
      });
    }
    
    this.currentSlideIndex = newSlideIndex;
    this.currentSlideStartTime = now;
    
    console.log(`📊 Slide changed to ${newSlideIndex + 1}, spent ${duration}s on previous slide`);
  }

  /**
   * Record reaction
   */
  recordReaction(reaction: {
    id: string;
    userId: string;
    userName: string;
    type: string;
    timestamp: number;
  }) {
    this.reactions.push({
      ...reaction,
      slideIndex: this.currentSlideIndex
    });
    console.log('😊 Reaction recorded:', reaction.type, 'on slide', this.currentSlideIndex + 1);
  }

  /**
   * End recording and save session
   */
  endRecording(): SessionRecording {
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - this.startTime.getTime()) / (1000 * 60)); // minutes
    
    // Record final slide timing
    const finalDuration = Math.round((Date.now() - this.currentSlideStartTime) / 1000);
    this.slideTimings.push({
      slideIndex: this.currentSlideIndex,
      timestamp: this.currentSlideStartTime,
      duration: finalDuration
    });

    const recording: SessionRecording = {
      id: this.sessionId,
      classroomId: this.classroomId,
      classroomName: this.classroomName,
      title: `Live Session - ${this.classroomName}`,
      hostId: this.hostId,
      hostName: this.hostName,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: duration,
      slides: this.slides,
      participants: Array.from(this.participants.values()),
      reactions: this.reactions,
      slideTimings: this.slideTimings
    };

    // Save to localStorage
    const recordings = safeLocalStorage.getJSON<SessionRecording[]>('demo_session_recordings', []);
    recordings.push(recording);
    
    // Keep only last 50 recordings to prevent storage bloat
    if (recordings.length > 50) {
      recordings.splice(0, recordings.length - 50);
    }
    
    safeLocalStorage.setJSON('demo_session_recordings', recordings);
    
    console.log('✅ Session recording saved:', recording.id, `(${duration} minutes)`);
    return recording;
  }

  /**
   * Get all recordings for a classroom
   */
  static getClassroomRecordings(classroomId: string): SessionRecording[] {
    const recordings = safeLocalStorage.getJSON<SessionRecording[]>('demo_session_recordings', []);
    return recordings.filter(r => r.classroomId === classroomId);
  }

  /**
   * Get all recordings (for student dashboard)
   */
  static getAllRecordings(): SessionRecording[] {
    return safeLocalStorage.getJSON<SessionRecording[]>('demo_session_recordings', []);
  }

  /**
   * Get recordings where user was a participant
   */
  static getUserRecordings(userId: string): SessionRecording[] {
    const recordings = safeLocalStorage.getJSON<SessionRecording[]>('demo_session_recordings', []);
    return recordings.filter(r => 
      r.participants.some(p => p.id === userId) || r.hostId === userId
    );
  }

  /**
   * Download session as JSON
   */
  static downloadSessionData(recording: SessionRecording) {
    const dataStr = JSON.stringify(recording, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${recording.classroomName}-${new Date(recording.startTime).toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('📥 Session data downloaded:', recording.id);
  }

  /**
   * Download all slides as a ZIP (simplified version)
   */
  static async downloadSlides(recording: SessionRecording) {
    try {
      // Create a simple HTML file with all slides
      const slideHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${recording.title} - Slides</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slide {
            background: white;
            margin-bottom: 20px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slide-header {
            background: #1e40af;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
        }
        .slide-content {
            padding: 20px;
            text-align: center;
        }
        .slide img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }
        .session-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
        }
        .info-label {
            font-weight: bold;
            color: #666;
            font-size: 0.9em;
        }
        .participants {
            margin-top: 20px;
        }
        .participant {
            display: inline-block;
            background: #e3f2fd;
            padding: 5px 10px;
            margin: 2px;
            border-radius: 15px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${recording.title}</h1>
        <div class="session-info">
            <div class="info-item">
                <div class="info-label">Host</div>
                <div>${recording.hostName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date</div>
                <div>${new Date(recording.startTime).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Duration</div>
                <div>${recording.duration} minutes</div>
            </div>
            <div class="info-item">
                <div class="info-label">Slides</div>
                <div>${recording.slides.length} slides</div>
            </div>
        </div>
        <div class="participants">
            <div class="info-label">Participants (${recording.participants.length})</div>
            ${recording.participants.map(p => `<span class="participant">${p.name} (${p.role})</span>`).join('')}
        </div>
    </div>
    
    ${recording.slides.map((slide, index) => `
        <div class="slide">
            <div class="slide-header">
                Slide ${index + 1}: ${slide.title}
            </div>
            <div class="slide-content">
                <img src="${slide.url}" alt="${slide.title}" />
            </div>
        </div>
    `).join('')}
    
    <div class="header">
        <h3>Session Statistics</h3>
        <p><strong>Total Reactions:</strong> ${recording.reactions.length}</p>
        <p><strong>Most Active Slide:</strong> Slide ${recording.slideTimings.reduce((max, timing) => timing.duration > max.duration ? timing : max, recording.slideTimings[0] || { slideIndex: 0, duration: 0 }).slideIndex + 1}</p>
    </div>
</body>
</html>`;

      const htmlBlob = new Blob([slideHtml], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `slides-${recording.classroomName}-${new Date(recording.startTime).toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('📥 Slides downloaded:', recording.id);
    } catch (error) {
      console.error('Failed to download slides:', error);
      alert('Failed to download slides. Please try again.');
    }
  }
}
