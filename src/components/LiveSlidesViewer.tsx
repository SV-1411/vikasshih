import { useEffect, useState } from 'react';
import { Image as ImageIcon, WifiOff } from 'lucide-react';
import type { Classroom } from '../types';
import { localBus } from '../lib/local-bus';

interface LiveSlidesViewerProps {
  classroom?: Classroom;
  lectureId?: string;
}

type LiveLectureSession = {
  id: string;
  classroom_id: string;
  college_id: string;
  teacher_id: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduled_at: string;
  created_at: string;
  updated_at: string;
  slides: string[];
  current_index: number;
};

const SESSIONS_KEY = 'demo_live_lectures';

function loadSessions(): LiveLectureSession[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function LiveSlidesViewer({ classroom, lectureId: lectureIdProp }: LiveSlidesViewerProps) {
  const [lectureId, setLectureId] = useState<string | null>(lectureIdProp || null);
  const [slides, setSlides] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'live' | 'ended' | 'not_found'>('idle');

  function refreshFromStorage(targetLectureId?: string) {
    const sessions = loadSessions();
    let session: LiveLectureSession | undefined;

    if (targetLectureId) {
      session = sessions.find(s => s.id === targetLectureId);
    } else if (classroom) {
      session = sessions.find(s => s.status === 'live' && s.classroom_id === classroom.id);
    }

    if (!session) {
      setStatus('not_found');
      return;
    }

    setLectureId(session.id);
    setSlides(session.slides || []);
    setCurrentIndex(session.current_index || 0);
    setStatus(session.status === 'live' ? 'live' : 'ended');
  }

  useEffect(() => {
    refreshFromStorage(lectureIdProp || undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom?.id, lectureIdProp]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === SESSIONS_KEY) {
        refreshFromStorage(lectureId || undefined);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [lectureId]);

  // Listen to intra-tab real-time updates from host
  useEffect(() => {
    if (!lectureId) return;
    const cleanup = localBus.on(`live_slides_update:${lectureId}`, (payload?: any) => {
      if (payload && typeof payload.index === 'number') {
        setCurrentIndex(payload.index);
      }
    });
    return cleanup;
  }, [lectureId]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-3 bg-white border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-md bg-indigo-50 text-indigo-600">
            <ImageIcon size={18} />
          </div>
          <div className="text-sm font-semibold text-gray-800">Live Slides</div>
        </div>
        {status !== 'live' && (
          <div className="flex items-center text-xs text-orange-600">
            <WifiOff className="w-4 h-4 mr-1" /> Waiting for host or session ended
          </div>
        )}
      </div>

      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        {status === 'not_found' || slides.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            <p className="mb-2">No live session found for this classroom.</p>
            <p className="text-sm">When your teacher starts a live slide session, it will appear here automatically.</p>
          </div>
        ) : (
          <div className="w-full h-full max-w-5xl mx-auto p-4">
            <div className="bg-white rounded shadow-sm h-full flex items-center justify-center overflow-hidden">
              <img
                src={slides[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              Slide {currentIndex + 1} / {slides.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
