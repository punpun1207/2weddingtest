import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoLightboxProps {
  images: { src: string; caption?: string }[];
  currentIndex: number | null;
  onClose: () => void;
  onSelectIndex: (idx: number) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onSelectIndex,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onSelectIndex((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onSelectIndex((currentIndex + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onSelectIndex]);

  if (currentIndex === null || !images[currentIndex]) return null;

  const current = images[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-60"
        title="Đóng"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={handlePrev}
        className="absolute left-4 sm:left-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-60"
        title="Ảnh trước"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 sm:right-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-60"
        title="Ảnh tiếp"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div
        className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.caption || 'Wedding moment'}
          className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border-4 border-white/15"
        />
        {current.caption && (
          <p className="font-serif italic text-white/95 mt-4 text-center text-sm sm:text-base tracking-wide px-4">
            {current.caption}
          </p>
        )}
      </div>
    </div>
  );
};
