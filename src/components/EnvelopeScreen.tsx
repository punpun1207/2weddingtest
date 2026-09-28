import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ChevronRight, X } from 'lucide-react';
import { weddingAudio } from '../utils/audio';

interface EnvelopeScreenProps {
  onOpenComplete: () => void;
  isOpenState: boolean;
  onClose?: () => void;
}

export const EnvelopeScreen: React.FC<EnvelopeScreenProps> = ({
  onOpenComplete,
  isOpenState,
  onClose,
}) => {
  // animation stages: 'sealed' | 'unsealing' | 'flap-open' | 'card-out' | 'card-focus' | 'done'
  const [stage, setStage] = useState<'sealed' | 'unsealing' | 'flap-open' | 'card-out' | 'card-focus' | 'done'>('sealed');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isOpenState && stage === 'sealed') {
      // ready
    }
  }, [isOpenState, stage]);

  const handleOpen = () => {
    if (stage !== 'sealed') return;
    try {
      weddingAudio.play();
    } catch {
      // ignored
    }
    // Step 1: Unseal wax
    setStage('unsealing');
    // Step 2: Flap rotates open 180 degrees
    setTimeout(() => {
      setStage('flap-open');
    }, 380);
    // Step 3: Card slides up smoothly
    setTimeout(() => {
      setStage('card-out');
    }, 1000);
    // Step 4: Card focuses for interaction
    setTimeout(() => {
      setStage('card-focus');
    }, 1800);
  };

  const handleEnterSite = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setStage('done');
      onOpenComplete();
    }, 600);
  };

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setStage('done');
      onOpenComplete();
    }, 350);
  };

  if (stage === 'done') return null;

  const isFlapOpen = stage === 'flap-open' || stage === 'card-out' || stage === 'card-focus';
  const isCardOut = stage === 'card-out' || stage === 'card-focus';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 35%, #55111a 0%, #2b050a 65%, #160205 100%)',
      }}
    >
      {/* Floating ambient petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-rose-200/20 backdrop-blur-xs petal-fall"
            style={{
              width: `${10 + (i % 4) * 5}px`,
              height: `${14 + (i % 3) * 6}px`,
              left: `${(i * 7 + 3) % 96}%`,
              top: `-${20 + (i % 5) * 10}px`,
              animationDuration: `${6 + (i % 5) * 2.5}s`,
              animationDelay: `${(i * 0.6) % 3.5}s`,
              transform: `rotate(${i * 25}deg)`,
            }}
          />
        ))}
      </div>

      {/* Top right Skip button */}
      <div className="absolute top-5 right-5 z-60 flex items-center gap-3">
        <button
          onClick={handleSkip}
          className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white border border-white/20 hover:border-white/50 px-4 py-2 rounded-full transition-all cursor-pointer backdrop-blur-sm"
        >
          Bỏ qua &amp; Xem ngay
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition-all cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md flex flex-col items-center justify-center pt-10 pb-6">
        {/* Header Script */}
        <div
          className={`text-center mb-6 transition-all duration-700 ${
            stage === 'card-focus' ? 'opacity-30 -translate-y-2' : 'opacity-100'
          }`}
        >
          <p className="font-script text-3xl sm:text-4xl text-amber-200/95 tracking-wide drop-shadow-md">
            Trân trọng kính mời
          </p>
          <p className="font-serif italic text-white/75 text-xs sm:text-sm tracking-[0.25em] mt-1 uppercase">
            Wedding Invitation
          </p>
        </div>

        {/* 400x260 3D ENVELOPE */}
        <div
          className="relative envelope-container w-[min(90vw,380px)] sm:w-[410px] aspect-[400/260] mx-auto cursor-pointer"
          onClick={stage === 'sealed' ? handleOpen : undefined}
        >
          {/* Ambient drop shadow under the envelope */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[88%] h-6 bg-black/60 blur-xl rounded-full transition-transform duration-500"
            style={{
              transform: isCardOut ? 'translateX(-50%) scale(1.08)' : 'translateX(-50%) scale(0.96)',
            }}
          />

          {/* 1. BACK PLATE (The envelope interior & base) */}
          <div
            className="absolute inset-0 rounded-xl shadow-2xl overflow-hidden border border-amber-900/40"
            style={{
              background: 'linear-gradient(150deg, #7A1C29 0%, #520F19 60%, #36080F 100%)',
              zIndex: 1,
            }}
          >
            {/* Elegant damask lining texture inside */}
            <div
              className="absolute inset-2 rounded-lg opacity-15"
              style={{
                backgroundImage: `radial-gradient(#D4AF37 1.5px, transparent 1.5px), radial-gradient(#D4AF37 1.5px, #420A12 1.5px)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            />
          </div>

          {/* 2. THE INVITATION CARD (SLIDES OUT OF POCKET) */}
          <div
            onClick={(e) => {
              if (stage === 'card-focus') {
                e.stopPropagation();
                handleEnterSite();
              }
            }}
            className={`absolute left-[5%] right-[5%] bottom-[4%] rounded-lg transition-all duration-1000 ease-out border border-[#E8D9CB] p-5 sm:p-6 text-center flex flex-col justify-between ${
              isCardOut ? 'shadow-2xl' : 'shadow-sm'
            }`}
            style={{
              background: 'linear-gradient(140deg, #FFFCF9 0%, #F7F2EA 100%)',
              height: '90%',
              zIndex: isCardOut ? 28 : 2,
              transform:
                stage === 'card-focus'
                  ? 'translateY(-140px) scale(1.04)'
                  : isCardOut
                  ? 'translateY(-110px)'
                  : 'translateY(0)',
              cursor: stage === 'card-focus' ? 'pointer' : 'default',
              visibility: stage === 'sealed' ? 'hidden' : 'visible',
            }}
          >
            {/* Inner gold & burgundy border */}
            <div className="absolute inset-1.5 border border-[#7A1C29]/20 rounded pointer-events-none" />
            <div className="absolute inset-2.5 border border-[#C5A059]/40 rounded pointer-events-none" />

            <div className="relative z-10 pt-0.5">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#7A1C29] font-medium font-sans">
                Save The Date
              </div>

              {/* Monogram Q & H */}
              <div className="font-display text-2xl sm:text-3xl font-bold text-[#7A1C29] mt-0.5 tracking-wider">
                Q <span className="font-script text-3xl sm:text-4xl text-[#C48B92] font-normal mx-0.5">&amp;</span> H
              </div>
              <div className="font-serif text-[#3A2A2B] font-semibold text-xs sm:text-sm tracking-wide mt-0.5 uppercase">
                HỒNG QUÂN &amp; THU HIỀN
              </div>
            </div>

            <div className="relative z-10 py-1">
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-serif text-[#7A1C29] border-t border-b border-[#7A1C29]/20 py-1 px-3">
                <span>16:00</span>
                <span>•</span>
                <span className="font-bold text-xs sm:text-sm tracking-wider">28 . 11 . 2026</span>
                <span>•</span>
                <span>THỨ BẢY</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7A1C29]/80 italic mt-0.5">
                White Palace • TP. Hà Nội
              </p>
            </div>

            {stage === 'card-focus' && (
              <div className="relative z-10 animate-pulse">
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs uppercase tracking-[0.16em] font-semibold text-[#7A1C29] bg-[#7A1C29]/10 px-3 py-1 rounded-full">
                  Chạm để mở thiệp <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>

          {/* 3. ENVELOPE POCKET FLAPS */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            style={{ zIndex: 12 }}
          >
            <svg
              className="w-full h-full drop-shadow-md"
              viewBox="0 0 400 260"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pocketLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#751824" />
                  <stop offset="100%" stopColor="#54101A" />
                </linearGradient>
                <linearGradient id="pocketRightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#751824" />
                  <stop offset="100%" stopColor="#4E0E18" />
                </linearGradient>
                <linearGradient id="pocketBottomGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#5D121D" />
                  <stop offset="100%" stopColor="#7B1D2B" />
                </linearGradient>
              </defs>

              {/* Left Flap */}
              <polygon points="0,0 215,130 0,260" fill="url(#pocketLeftGrad)" />
              {/* Right Flap */}
              <polygon points="400,0 185,130 400,260" fill="url(#pocketRightGrad)" />
              {/* Bottom Flap */}
              <polygon points="0,260 200,105 400,260" fill="url(#pocketBottomGrad)" />

              {/* Gold foil lines */}
              <line
                x1="0"
                y1="260"
                x2="200"
                y2="105"
                stroke="#D4AF37"
                strokeWidth="1.2"
                strokeOpacity="0.45"
              />
              <line
                x1="400"
                y1="260"
                x2="200"
                y2="105"
                stroke="#D4AF37"
                strokeWidth="1.2"
                strokeOpacity="0.45"
              />
            </svg>
          </div>

          {/* 4. TOP FLAP (3D ROTATION) */}
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              height: '57%',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              transform: isFlapOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
              transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: isFlapOpen ? 3 : 20,
            }}
          >
            {/* Front of flap (when closed) */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <svg
                className="w-full h-full drop-shadow-lg"
                viewBox="0 0 400 148"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="flapFrontGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#8C1F2E" />
                    <stop offset="70%" stopColor="#6E1623" />
                    <stop offset="100%" stopColor="#55101A" />
                  </linearGradient>
                </defs>
                <polygon points="0,0 400,0 200,148" fill="url(#flapFrontGrad)" />
                <line
                  x1="0"
                  y1="0"
                  x2="200"
                  y2="148"
                  stroke="#D4AF37"
                  strokeWidth="1.4"
                  strokeOpacity="0.6"
                />
                <line
                  x1="400"
                  y1="0"
                  x2="200"
                  y2="148"
                  stroke="#D4AF37"
                  strokeWidth="1.4"
                  strokeOpacity="0.6"
                />
              </svg>
            </div>

            {/* Back of flap */}
            <div
              className="absolute inset-0"
              style={{
                transform: 'rotateX(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 400 148" preserveAspectRatio="none">
                <polygon points="0,148 400,148 200,0" fill="#4D0E17" />
              </svg>
            </div>
          </div>

          {/* 5. CIRCULAR WAX SEAL */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 z-25 ${
              stage === 'sealed'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-50 pointer-events-none'
            }`}
            style={{
              top: '56.9%',
              width: '66px',
              height: '66px',
            }}
            title="Chạm để mở thiệp"
          >
            <div
              className={`w-full h-full rounded-full flex items-center justify-center relative shadow-2xl border-2 border-amber-300/40 select-none overflow-hidden ${
                stage === 'sealed' ? 'wax-seal-pulse' : ''
              }`}
              style={{
                background: 'radial-gradient(circle at 35% 30%, #A42838 0%, #751724 55%, #440911 100%)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.65), inset 0 2px 4px rgba(255,255,255,0.3)',
              }}
            >
              <img
                src="/images/sap.png"
                alt="Wax Seal"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback to stylized SVG seal if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Outer embossed ring */}
              <div className="absolute inset-1 rounded-full border border-amber-300/30 pointer-events-none" />
              {/* Monogram fallback / overlay */}
              <div className="absolute flex flex-col items-center justify-center text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pointer-events-none">
                <span className="font-display font-bold text-xs tracking-wider">Q&amp;H</span>
                <Heart className="w-2.5 h-2.5 fill-amber-300 text-amber-300 mt-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button below envelope */}
        <div className="mt-12 sm:mt-14 text-center z-30">
          {stage === 'sealed' ? (
            <button
              onClick={handleOpen}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-[#2B060A] font-semibold text-xs sm:text-sm tracking-widest uppercase shadow-lg shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans"
            >
              <Sparkles className="w-4 h-4" />
              Chạm vào thiệp để mở
            </button>
          ) : stage === 'card-focus' ? (
            <button
              onClick={handleEnterSite}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8E2030] to-[#55101A] text-white font-serif text-sm sm:text-base tracking-wider border border-amber-300/40 shadow-xl shadow-black/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Xem Toàn Bộ Thiệp Cưới</span>
              <ChevronRight className="w-4 h-4 text-amber-300" />
            </button>
          ) : (
            <div className="text-amber-100/75 font-serif italic text-sm tracking-wider flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Đang mở thiệp mừng...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
