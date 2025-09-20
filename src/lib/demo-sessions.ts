/**
 * Demo session recordings for testing
 */

import { safeLocalStorage } from './error-utils';
import { demoSlides } from './demo-slides';
import type { SessionRecording } from './session-recorder';

export function initializeDemoSessions() {
  const existingRecordings = safeLocalStorage.getJSON<SessionRecording[]>('demo_session_recordings', []);
  
  if (existingRecordings.length === 0) {
    console.log('📹 Creating demo session recordings...');
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    const demoRecordings: SessionRecording[] = [
      {
        id: 'session_demo_1',
        classroomId: 'classroom_demo_1',
        classroomName: 'Web Development 101',
        title: 'Live Session - Web Development 101',
        hostId: 'teacher_demo_1',
        hostName: 'Demo Teacher',
        startTime: yesterday.toISOString(),
        endTime: new Date(yesterday.getTime() + 45 * 60 * 1000).toISOString(), // 45 minutes
        duration: 45,
        slides: demoSlides,
        participants: [
          {
            id: 'teacher_demo_1',
            name: 'Demo Teacher',
            role: 'teacher',
            joinTime: yesterday.toISOString()
          },
          {
            id: 'student_demo_1',
            name: 'Demo Student',
            role: 'student',
            joinTime: new Date(yesterday.getTime() + 2 * 60 * 1000).toISOString()
          },
          {
            id: 'student_demo_2',
            name: 'Alice Johnson',
            role: 'student',
            joinTime: new Date(yesterday.getTime() + 5 * 60 * 1000).toISOString()
          },
          {
            id: 'student_demo_3',
            name: 'Bob Smith',
            role: 'student',
            joinTime: new Date(yesterday.getTime() + 3 * 60 * 1000).toISOString()
          }
        ],
        reactions: [
          {
            id: 'reaction_1',
            userId: 'student_demo_1',
            userName: 'Demo Student',
            type: '👍',
            timestamp: yesterday.getTime() + 10 * 60 * 1000,
            slideIndex: 1
          },
          {
            id: 'reaction_2',
            userId: 'student_demo_2',
            userName: 'Alice Johnson',
            type: '❤️',
            timestamp: yesterday.getTime() + 15 * 60 * 1000,
            slideIndex: 2
          },
          {
            id: 'reaction_3',
            userId: 'student_demo_3',
            userName: 'Bob Smith',
            type: '🙋',
            timestamp: yesterday.getTime() + 25 * 60 * 1000,
            slideIndex: 4
          },
          {
            id: 'reaction_4',
            userId: 'student_demo_1',
            userName: 'Demo Student',
            type: '😊',
            timestamp: yesterday.getTime() + 30 * 60 * 1000,
            slideIndex: 4
          },
          {
            id: 'reaction_5',
            userId: 'student_demo_2',
            userName: 'Alice Johnson',
            type: '💬',
            timestamp: yesterday.getTime() + 40 * 60 * 1000,
            slideIndex: 5
          }
        ],
        slideTimings: [
          { slideIndex: 0, timestamp: yesterday.getTime(), duration: 300 }, // 5 minutes
          { slideIndex: 1, timestamp: yesterday.getTime() + 5 * 60 * 1000, duration: 480 }, // 8 minutes
          { slideIndex: 2, timestamp: yesterday.getTime() + 13 * 60 * 1000, duration: 420 }, // 7 minutes
          { slideIndex: 3, timestamp: yesterday.getTime() + 20 * 60 * 1000, duration: 600 }, // 10 minutes
          { slideIndex: 4, timestamp: yesterday.getTime() + 30 * 60 * 1000, duration: 720 }, // 12 minutes
          { slideIndex: 5, timestamp: yesterday.getTime() + 42 * 60 * 1000, duration: 180 } // 3 minutes
        ]
      },
      {
        id: 'session_demo_2',
        classroomId: 'classroom_demo_2',
        classroomName: 'Advanced JavaScript',
        title: 'Live Session - Advanced JavaScript',
        hostId: 'teacher_demo_1',
        hostName: 'Demo Teacher',
        startTime: twoDaysAgo.toISOString(),
        endTime: new Date(twoDaysAgo.getTime() + 60 * 60 * 1000).toISOString(), // 60 minutes
        duration: 60,
        slides: demoSlides.slice(0, 4), // First 4 slides
        participants: [
          {
            id: 'teacher_demo_1',
            name: 'Demo Teacher',
            role: 'teacher',
            joinTime: twoDaysAgo.toISOString()
          },
          {
            id: 'student_demo_1',
            name: 'Demo Student',
            role: 'student',
            joinTime: new Date(twoDaysAgo.getTime() + 1 * 60 * 1000).toISOString()
          },
          {
            id: 'admin_demo_1',
            name: 'Demo Admin',
            role: 'admin',
            joinTime: new Date(twoDaysAgo.getTime() + 10 * 60 * 1000).toISOString()
          }
        ],
        reactions: [
          {
            id: 'reaction_6',
            userId: 'student_demo_1',
            userName: 'Demo Student',
            type: '👍',
            timestamp: twoDaysAgo.getTime() + 20 * 60 * 1000,
            slideIndex: 2
          },
          {
            id: 'reaction_7',
            userId: 'admin_demo_1',
            userName: 'Demo Admin',
            type: '❤️',
            timestamp: twoDaysAgo.getTime() + 35 * 60 * 1000,
            slideIndex: 3
          }
        ],
        slideTimings: [
          { slideIndex: 0, timestamp: twoDaysAgo.getTime(), duration: 600 }, // 10 minutes
          { slideIndex: 1, timestamp: twoDaysAgo.getTime() + 10 * 60 * 1000, duration: 900 }, // 15 minutes
          { slideIndex: 2, timestamp: twoDaysAgo.getTime() + 25 * 60 * 1000, duration: 1200 }, // 20 minutes
          { slideIndex: 3, timestamp: twoDaysAgo.getTime() + 45 * 60 * 1000, duration: 900 } // 15 minutes
        ]
      }
    ];
    
    safeLocalStorage.setJSON('demo_session_recordings', demoRecordings);
    console.log('✅ Demo session recordings created:', demoRecordings.length);
  }
}
