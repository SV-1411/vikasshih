import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Play, Square, ChevronLeft, ChevronRight, UploadCloud } from 'lucide-react';
import type { Classroom, Profile } from '../types';
import { localBus } from '../lib/local-bus';

interface LiveSlidesHostProps {
  classroom: Classroom;
  currentUser: Profile;
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
  // Extended fields for slide-based sessions (stored locally for demo)
  slides: string[]; // data URLs or absolute URLs
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

function saveSessions(sessions: LiveLectureSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

export default function LiveSlidesHost({ classroom, currentUser }: LiveSlidesHostProps) {
  const [title, setTitle] = useState<string>('Lecture Slides');
  const [slides, setSlides] = useState<string[]>([]);
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const collegeId = currentUser.college_id || classroom.college_id || '';

  // Resume existing live session if present (same teacher + classroom)
  useEffect(() => {
    const sessions = loadSessions();
    const existing = sessions.find(
      s => s.status === 'live' && s.classroom_id === classroom.id && s.teacher_id === currentUser.id
    );
    if (existing) {
      setLectureId(existing.id);
      setSlides(existing.slides || []);
      setCurrentIndex(existing.current_index || 0);
      setTitle(existing.title || 'Lecture Slides');
    }
  }, [classroom.id, currentUser.id]);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    // Convert to data URLs (works offline and across tabs)
    const images = Array.from(files).filter(f => f.type.startsWith('image/'));
    const dataUrls: string[] = [];
    for (const img of images) {
      const b64 = await fileToDataUrl(img);
      dataUrls.push(b64);
    }
    // Sort by filename to keep order predictable
    dataUrls.sort();
    setSlides(prev => [...prev, ...dataUrls]);
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function startLive() {
    if (slides.length === 0) return;
    const sessions = loadSessions();
    // End any other live session in this classroom by this teacher
    for (const s of sessions) {
      if (s.status === 'live' && s.classroom_id === classroom.id && s.teacher_id === currentUser.id) {
        s.status = 'ended';
      }
    }
    const id = `lec_${Date.now()}`;
    const now = new Date().toISOString();
    const session: LiveLectureSession = {
      id,
      classroom_id: classroom.id,
      college_id: collegeId,
      teacher_id: currentUser.id,
      title: title || 'Lecture Slides',
      status: 'live',
      scheduled_at: now,
      created_at: now,
      updated_at: now,
      slides: slides,
      current_index: 0,
    };
    sessions.push(session);
    saveSessions(sessions);
    setLectureId(id);
    setCurrentIndex(0);
    // Notify dashboards to refresh
    localBus.emit(`live_lecture_changed:${collegeId}`, { type: 'started', lecture: session });
  }

  function endLive() {
    if (!lectureId) return;
    const sessions = loadSessions();
    const s = sessions.find(x => x.id === lectureId);
    if (s) {
      s.status = 'ended';
      s.updated_at = new Date().toISOString();
      saveSessions(sessions);
      localBus.emit(`live_lecture_changed:${collegeId}`, { type: 'ended', lecture: s });
    }
    setLectureId(null);
  }

  function broadcast(index: number) {
    if (!lectureId) return;
    // Update storage
    const sessions = loadSessions();
    const s = sessions.find(x => x.id === lectureId);
    if (s) {
      s.current_index = index;
      s.updated_at = new Date().toISOString();
      saveSessions(sessions);
    }
    // Emit small payload (slide index only)
    localBus.emit(`live_slides_update:${lectureId}`, { index });
  }

  function prev() {
    if (!lectureId) return;
    const nextIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(nextIndex);
    broadcast(nextIndex);
  }

  function next() {
    if (!lectureId) return;
    const nextIndex = Math.min(slides.length - 1, currentIndex + 1);
    setCurrentIndex(nextIndex);
    broadcast(nextIndex);
  }

  const hasLive = !!lectureId;

  return (
    <div className="h-full w-full flex flex-col">
      {/* Controls */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-indigo-50 text-indigo-600">
              <ImageIcon size={18} />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session title"
              className="border rounded px-3 py-2 text-sm w-64"
              disabled={hasLive}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
              disabled={hasLive}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border rounded text-sm flex items-center"
              disabled={hasLive}
            >
              <UploadCloud className="w-4 h-4 mr-1" /> Upload Images
            </button>
            <div className="text-xs text-gray-500">{slides.length} slide(s)</div>
          </div>
          <div className="flex items-center space-x-2">
            {!hasLive ? (
              <button
                onClick={startLive}
                disabled={slides.length === 0}
                className="px-3 py-2 bg-red-600 text-white rounded flex items-center disabled:opacity-50"
                title={slides.length === 0 ? 'Upload at least one slide' : 'Start Live'}
              >
                <Play className="w-4 h-4 mr-1" /> Start Live
              </button>
            ) : (
              <button
                onClick={endLive}
                className="px-3 py-2 bg-gray-700 text-white rounded flex items-center"
              >
                <Square className="w-4 h-4 mr-1" /> End Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        {slides.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="mb-2">Upload images to create a slide deck.</p>
            <p className="text-sm">PNG/JPG, low bandwidth friendly.</p>
          </div>
        ) : (
          <div className="w-full h-full max-w-5xl mx-auto p-4 flex flex-col">
            <div className="flex-1 bg-white rounded shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src={slides[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={prev} disabled={!hasLive || currentIndex === 0} className="px-3 py-2 border rounded flex items-center disabled:opacity-50">
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </button>
              <div className="text-sm text-gray-600">
                Slide {currentIndex + 1} / {slides.length}
              </div>
              <button onClick={next} disabled={!hasLive || currentIndex >= slides.length - 1} className="px-3 py-2 border rounded flex items-center disabled:opacity-50">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
