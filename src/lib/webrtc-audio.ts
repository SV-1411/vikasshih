/**
 * WebRTC Audio Management for Live Slides
 * Uses Opus codec for low bandwidth audio streaming
 */

import { safeLocalStorage } from './error-utils';

export interface AudioParticipant {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'admin';
  isMuted: boolean;
  isSpeaking: boolean;
  stream?: MediaStream;
  connection?: RTCPeerConnection;
}

export class WebRTCAudioManager {
  private localStream: MediaStream | null = null;
  private participants: Map<string, AudioParticipant> = new Map();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private onParticipantUpdate: ((participants: AudioParticipant[]) => void) | null = null;
  private roomId: string;
  private userId: string;
  private userName: string;
  private userRole: 'teacher' | 'student' | 'admin';

  constructor(
    roomId: string,
    userId: string,
    userName: string,
    userRole: 'teacher' | 'student' | 'admin'
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.userRole = userRole;
    
    // Initialize audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * Initialize local audio stream with Opus codec preference
   */
  async initializeAudio(): Promise<boolean> {
    try {
      console.log('🎤 Initializing audio...');
      
      // Request microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Opus optimal sample rate
        }
      });

      // Set up audio analysis for speaking detection
      if (this.audioContext && this.localStream) {
        const source = this.audioContext.createMediaStreamSource(this.localStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);
        
        // Start monitoring audio levels
        this.monitorAudioLevels();
      }

      console.log('✅ Audio initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Monitor audio levels for speaking detection
   */
  private monitorAudioLevels() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const isSpeaking = average > 20; // Threshold for speaking detection
      
      // Update local participant speaking status
      const localParticipant = this.participants.get(this.userId);
      if (localParticipant && localParticipant.isSpeaking !== isSpeaking) {
        localParticipant.isSpeaking = isSpeaking;
        this.notifyParticipantUpdate();
      }
      
      requestAnimationFrame(checkAudioLevel);
    };
    
    checkAudioLevel();
  }

  /**
   * Join audio room (simplified for demo - uses localStorage for signaling)
   */
  async joinRoom(): Promise<void> {
    console.log(`🚪 Joining audio room: ${this.roomId}`);
    
    // Add self as participant
    this.participants.set(this.userId, {
      id: this.userId,
      name: this.userName,
      role: this.userRole,
      isMuted: false,
      isSpeaking: false,
      stream: this.localStream || undefined
    });

    // Store in localStorage for demo
    const rooms = safeLocalStorage.getJSON<any>('demo_audio_rooms', {});
    if (!rooms[this.roomId]) {
      rooms[this.roomId] = { participants: [] };
    }
    
    const existingIndex = rooms[this.roomId].participants.findIndex((p: any) => p.id === this.userId);
    const participantData = {
      id: this.userId,
      name: this.userName,
      role: this.userRole,
      joinedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      rooms[this.roomId].participants[existingIndex] = participantData;
    } else {
      rooms[this.roomId].participants.push(participantData);
    }
    
    safeLocalStorage.setJSON('demo_audio_rooms', rooms);
    
    // Simulate other participants joining (for demo)
    this.simulateParticipants();
    
    this.notifyParticipantUpdate();
  }

  /**
   * Simulate other participants for demo
   */
  private simulateParticipants() {
    // Check localStorage for other participants
    const rooms = safeLocalStorage.getJSON<any>('demo_audio_rooms', {});
    const room = rooms[this.roomId];
    
    if (room && room.participants) {
      room.participants.forEach((p: any) => {
        if (p.id !== this.userId && !this.participants.has(p.id)) {
          this.participants.set(p.id, {
            id: p.id,
            name: p.name,
            role: p.role,
            isMuted: false,
            isSpeaking: false
          });
        }
      });
    }
  }

  /**
   * Toggle mute status
   */
  toggleMute(): boolean {
    if (!this.localStream) return false;
    
    const audioTracks = this.localStream.getAudioTracks();
    const newMuteState = !audioTracks[0]?.enabled;
    
    audioTracks.forEach(track => {
      track.enabled = !newMuteState;
    });
    
    // Update participant status
    const localParticipant = this.participants.get(this.userId);
    if (localParticipant) {
      localParticipant.isMuted = newMuteState;
      this.notifyParticipantUpdate();
    }
    
    return newMuteState;
  }

  /**
   * Leave audio room
   */
  async leaveRoom(): Promise<void> {
    console.log('👋 Leaving audio room');
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Remove from localStorage
    const rooms = safeLocalStorage.getJSON<any>('demo_audio_rooms', {});
    if (rooms[this.roomId]) {
      rooms[this.roomId].participants = rooms[this.roomId].participants.filter(
        (p: any) => p.id !== this.userId
      );
      safeLocalStorage.setJSON('demo_audio_rooms', rooms);
    }
    
    // Clear participants
    this.participants.clear();
    this.notifyParticipantUpdate();
  }

  /**
   * Set participant update callback
   */
  onParticipantsChanged(callback: (participants: AudioParticipant[]) => void) {
    this.onParticipantUpdate = callback;
  }

  /**
   * Notify about participant updates
   */
  private notifyParticipantUpdate() {
    if (this.onParticipantUpdate) {
      this.onParticipantUpdate(Array.from(this.participants.values()));
    }
  }

  /**
   * Get current participants
   */
  getParticipants(): AudioParticipant[] {
    return Array.from(this.participants.values());
  }

  /**
   * Check if audio is supported
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }
}
