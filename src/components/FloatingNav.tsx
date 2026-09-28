import React, { useState } from 'react';
import { Mail, Music, VolumeX, Gift, Calendar, Heart } from 'lucide-react';
import { weddingAudio } from '../utils/audio';

interface FloatingNavProps {
  onReopenEnvelope: () => void;
  onOpenGiftModal: () => void;
  onScrollToWishes: () => void;
  onOpenCalendar: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  onReopenEnvelope,
  onOpenGiftModal,
  onScrollToWishes,
  onOpenCalendar,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    const nextState = weddingAudio.toggle();
    setIsPlaying(nextState);
  };

  return (
    <aside
      aria-label="Điều khiển trang thiệp cưới"
      className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5"
    >
      {/* Replay envelope opening */}
      <button
        onClick={onReopenEnvelope}
        className="group flex items-center gap-2 bg-white/90 hover:bg-white text-[#7A1C29] px-3.5 py-2 rounded-full shadow-lg border border-[#7A1C29]/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-serif font-semibold"
        title="Mở lại phong bì"
      >
        <Mail className="w-4 h-4 text-[#7A1C29]" />
        <span className="hidden sm:inline">Mở lại thiệp</span>
      </button>

      {/* Gift Box button */}
      <button
        onClick={onOpenGiftModal}
        className="group flex items-center gap-2 bg-[#7A1C29] hover:bg-[#5E141E] text-white px-3.5 py-2 rounded-full shadow-lg border border-amber-300/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-serif font-semibold"
        title="Hộp mừng cưới"
      >
        <Gift className="w-4 h-4 text-amber-300" />
        <span className="hidden sm:inline">Mừng cưới</span>
      </button>

      {/* RSVP Quick Jump */}
      <button
        onClick={onScrollToWishes}
        className="group flex items-center gap-2 bg-white/90 hover:bg-white text-[#7A1C29] px-3.5 py-2 rounded-full shadow-lg border border-[#7A1C29]/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-serif font-semibold"
        title="Gửi lời chúc & RSVP"
      >
        <Heart className="w-4 h-4 text-[#7A1C29] fill-[#7A1C29]/20" />
        <span className="hidden sm:inline">Gửi lời chúc</span>
      </button>

      {/* Calendar Reminder */}
      <button
        onClick={onOpenCalendar}
        className="group flex items-center gap-2 bg-white/90 hover:bg-white text-[#7A1C29] px-3.5 py-2 rounded-full shadow-lg border border-[#7A1C29]/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-serif font-semibold"
        title="Thêm vào lịch"
      >
        <Calendar className="w-4 h-4 text-[#7A1C29]" />
        <span className="hidden sm:inline">Thêm lịch</span>
      </button>

      {/* Music Toggle */}
      <button
        onClick={toggleMusic}
        className={`flex items-center justify-center w-11 h-11 rounded-full shadow-xl border backdrop-blur-md transition-all cursor-pointer ${
          isPlaying
            ? 'bg-[#7A1C29] text-amber-300 border-amber-300/50 scale-105 ring-4 ring-[#7A1C29]/20'
            : 'bg-white/90 text-stone-600 border-stone-300 hover:text-[#7A1C29]'
        }`}
        title={isPlaying ? 'Tắt nhạc' : 'Bật nhạc Bạn Đời (Đức Phúc)'}
      >
        {isPlaying ? (
          <div className="relative flex items-center justify-center">
            <Music className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
};
