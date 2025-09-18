import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Bookmark, Settings } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  bookmarks?: number[];
  onAddBookmark?: (time: number) => void;
}

export default function AudioPlayer({ 
  src, 
  title, 
  onTimeUpdate, 
  onComplete, 
  bookmarks = [],
  onAddBookmark 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      setCurrentTime(current);
      onTimeUpdate?.(current, audio.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onComplete]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlaybackRateChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const addBookmark = () => {
    onAddBookmark?.(currentTime);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <audio 
        ref={audioRef} 
        src={src}
        preload="metadata"
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        
        {/* Progress Bar */}
        <div className="relative">
          <div 
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-blue-500 rounded-full relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-md"></div>
            </div>
          </div>
          
          {/* Bookmarks */}
          {bookmarks.map((bookmark, index) => (
            <div
              key={index}
              className="absolute top-0 w-1 h-2 bg-yellow-400 transform -translate-x-1/2"
              style={{ left: `${(bookmark / duration) * 100}%` }}
            />
          ))}
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={() => skipTime(-10)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <SkipBack size={20} />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={() => skipTime(10)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Volume2 size={16} className="text-gray-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (audioRef.current) {
                audioRef.current.volume = newVolume;
              }
            }}
            className="w-20"
          />
        </div>

        <button
          onClick={addBookmark}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Add bookmark"
        >
          <Bookmark size={16} className="text-gray-600" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings size={16} className="text-gray-600" />
          </button>
          
          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-2">
              <div className="text-sm text-gray-700 mb-2">Playback Speed</div>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded ${
                    playbackRate === rate ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}