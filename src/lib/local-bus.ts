// Local event bus for real-time updates between demo accounts
// Uses browser's native event system for cross-tab communication

export class LocalBus {
  // Emit an event that other components can listen to
  emit(eventName: string, data?: any) {
    window.dispatchEvent(new CustomEvent(`localbus:${eventName}`, { detail: data }));
  }

  // Listen for events
  on(eventName: string, callback: (data?: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener(`localbus:${eventName}`, handler as EventListener);
    return () => window.removeEventListener(`localbus:${eventName}`, handler as EventListener);
  }

  // One-time listener
  once(eventName: string, callback: (data?: any) => void) {
    const cleanup = this.on(eventName, (data) => {
      cleanup();
      callback(data);
    });
    return cleanup;
  }
}

export const localBus = new LocalBus();

// Helper functions for common demo events
export const demoEvents = {
  // Chat events
  chatMessage: (classroomId: string) => `chat:${classroomId}`,
  
  // Poll events
  pollCreated: (classroomId: string) => `poll_created:${classroomId}`,
  pollResponse: (pollId: string) => `poll_response:${pollId}`,
  
  // Quiz events
  quizCreated: (classroomId: string) => `quiz_created:${classroomId}`,
  quizAttempt: (quizId: string) => `quiz_attempt:${quizId}`,
  
  // Classroom events
  classroomJoined: (classroomId: string) => `classroom_joined:${classroomId}`,
  classroomUpdated: (classroomId: string) => `classroom_updated:${classroomId}`,
};
