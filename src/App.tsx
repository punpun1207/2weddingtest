import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Send,
  Camera,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Gift,
  Volume2,
} from 'lucide-react';
import { EnvelopeScreen } from './components/EnvelopeScreen';
import { FloatingNav } from './components/FloatingNav';
import { GiftModal } from './components/GiftModal';
import { PhotoLightbox } from './components/PhotoLightbox';
import { getGoogleCalendarUrl, downloadIcsFile } from './utils/calendar';
import { WishItem } from './types';

export default function App() {
  // Envelope modal state
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // RSVP Form state
  const [guestName, setGuestName] = useState('');
  const [guestWish, setGuestWish] = useState('');
  const [attendance, setAttendance] = useState('Tham dự');
  const [plusOne, setPlusOne] = useState('Đi 1 mình');
  const [guestOf, setGuestOf] = useState('Cả hai');
  const [guestImageFile, setGuestImageFile] = useState<File | null>(null);
  const [guestImagePreview, setGuestImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(null);

  // Address copy notification
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Wishes List (initial heartfelt wishes + saved in localStorage)
  const initialWishes: WishItem[] = [
    {
      id: 'w1',
      name: 'Nguyễn Tiến Dũng & Gia đình',
      wish: 'Chúc Hồng Quân & Thu Hiền trăm năm hạnh phúc, đầu bạc răng long, chúc hai bạn luôn đồng hành và yêu thương nhau trên mọi nẻo đường!',
      attendance: 'Tham dự',
      plusOne: 'Đi cùng gia đình',
      guestOf: 'Cả hai',
      createdAt: 'Hôm nay',
    },
    {
      id: 'w2',
      name: 'Minh Trí & Hội Bạn Thân',
      wish: 'Chúc Quân Neymar lấy được vợ thảo hiền, chúc Thu Hiền luôn rạng ngời và xinh đẹp. Chúc mừng ngày hạnh phúc nhất của hai bạn!',
      attendance: 'Tham dự',
      plusOne: 'Đi 1 mình',
      guestOf: 'Nhà trai',
      createdAt: 'Hôm qua',
    },
    {
      id: 'w3',
      name: 'Phương Thảo & Minh Quân',
      wish: 'Mừng ngày vui của Hiền Đầu Bò và Quân! Chúc hai bạn sớm đón thêm thiên thần nhỏ đáng yêu và mái ấm luôn ngập tràn tiếng cười!',
      attendance: 'Tham dự',
      plusOne: 'Đi cùng 1 người',
      guestOf: 'Nhà gái',
      createdAt: '2 ngày trước',
    },
  ];

  const [wishes, setWishes] = useState<WishItem[]>(() => {
    try {
      const saved = localStorage.getItem('wedding_wishes_hq_th');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialWishes;
  });

  // Countdown timer logic to wedding date: 28/11/2026 16:00 UTC+7
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    daysSince: 0,
  });

  useEffect(() => {
    const weddingDate = new Date('2026-11-28T16:00:00+07:00').getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = weddingDate - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          isPast: false,
          daysSince: 0,
        });
      } else {
        const daysPast = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
          daysSince: daysPast,
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // IntersectionObserver for scroll-reveal animations across all sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [showEnvelope]);

  // Gallery Photos
  const galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      caption: 'Khoảnh khắc ngọt ngào của Hồng Quân & Thu Hiền',
    },
    {
      src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
      caption: 'Nắm tay em đi qua mọi mùa yêu thương',
    },
    {
      src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
      caption: 'Bó hoa rum tinh khôi ngày trọng đại',
    },
    {
      src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=85',
      caption: 'Chặng đường mới, tổ ấm ngập tràn yêu thương',
    },
    {
      src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
      caption: 'Nụ cười rạng rỡ của đôi uyên ương',
    },
    {
      src: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=85',
      caption: 'Từng chi tiết được chuẩn bị chu đáo',
    },
    {
      src: 'https://images.unsplash.com/photo-1519225438150-7117c2f6d0f0?auto=format&fit=crop&w=1200&q=85',
      caption: 'Ánh hoàng hôn lãng mạn bên nhau',
    },
  ];

  // Scroll helpers
  const formRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const scrollToWishes = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Image upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGuestImageFile(file);
      const preview = URL.createObjectURL(file);
      setGuestImagePreview(preview);
    }
  };

  // Canvas Text wrap helper
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  };

  // Form submission and Canvas card rendering matching Duc Manh specs
  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestWish.trim()) return;

    setIsSubmitting(true);

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Generate 1080x1080 keepsake canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Parchment cream background
        ctx.fillStyle = '#F8F5F4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Double burgundy borders with gold accent
        ctx.strokeStyle = '#7A1C29';
        ctx.lineWidth = 14;
        ctx.strokeRect(35, 35, 1010, 1010);

        ctx.strokeStyle = '#C5A059';
        ctx.lineWidth = 3;
        ctx.strokeRect(55, 55, 970, 970);

        // Header matching Duc Manh
        ctx.fillStyle = '#7A1C29';
        ctx.font = "bold 56px 'Playfair Display', Georgia, serif";
        ctx.textAlign = 'center';
        ctx.fillText('Wedding Wishes', canvas.width / 2, 140);

        ctx.fillStyle = '#C5A059';
        ctx.font = "italic 36px 'Cormorant Garamond', Georgia, serif";
        ctx.fillText('Hồng Quân & Thu Hiền • 28.11.2026', canvas.width / 2, 195);

        // Decorative line
        ctx.strokeStyle = 'rgba(122, 28, 41, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(340, 225);
        ctx.lineTo(740, 225);
        ctx.stroke();

        const finalizeCard = () => {
          const cardData = canvas.toDataURL('image/jpeg', 0.92);
          setGeneratedCardUrl(cardData);

          const newWishItem: WishItem = {
            id: `w-${Date.now()}`,
            name: guestName.trim(),
            wish: guestWish.trim(),
            attendance,
            plusOne,
            guestOf,
            createdAt: 'Vừa xong',
            photoUrl: guestImagePreview || undefined,
          };

          const updatedWishes = [newWishItem, ...wishes];
          setWishes(updatedWishes);

          try {
            localStorage.setItem('wedding_wishes_hq_th', JSON.stringify(updatedWishes));
          } catch {
            // ignore
          }

          setIsSubmitting(false);
          setSubmitSuccess(true);
        };

        if (guestImagePreview) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const targetW = 760;
            const targetH = 430;
            const ratio = Math.max(targetW / img.width, targetH / img.height);
            const drawW = img.width * ratio;
            const drawH = img.height * ratio;
            const sx = (drawW - targetW) / 2 / ratio;
            const sy = (drawH - targetH) / 2 / ratio;

            ctx.drawImage(
              img,
              sx,
              sy,
              img.width - sx * 2,
              img.height - sy * 2,
              160,
              265,
              targetW,
              targetH
            );

            // Frame around image
            ctx.strokeStyle = '#7A1C29';
            ctx.lineWidth = 6;
            ctx.strokeRect(160, 265, targetW, targetH);

            // Wish Text
            ctx.font = "italic 40px 'Cormorant Garamond', Georgia, serif";
            ctx.fillStyle = '#3A2A2B';
            ctx.textAlign = 'center';
            const textY = wrapText(
              ctx,
              `“${guestWish.trim()}”`,
              canvas.width / 2,
              770,
              840,
              54
            );

            // Guest Signature
            ctx.font = "bold 65px 'Great Vibes', cursive";
            ctx.fillStyle = '#7A1C29';
            ctx.textAlign = 'right';
            ctx.fillText(`- ${guestName.trim()}`, 920, Math.min(textY + 65, 980));

            finalizeCard();
          };
          img.src = guestImagePreview;
        } else {
          // No image: larger quote layout
          ctx.font = "italic 52px 'Cormorant Garamond', Georgia, serif";
          ctx.fillStyle = '#3A2A2B';
          ctx.textAlign = 'center';
          const textY = wrapText(
            ctx,
            `“${guestWish.trim()}”`,
            canvas.width / 2,
            470,
            860,
            72
          );

          ctx.font = "bold 86px 'Great Vibes', cursive";
          ctx.fillStyle = '#7A1C29';
          ctx.textAlign = 'right';
          ctx.fillText(`- ${guestName.trim()}`, 900, Math.min(textY + 110, 940));

          finalizeCard();
        }
      }
    } catch {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }
  };

  const copyVenueAddress = () => {
    navigator.clipboard.writeText(
      'White Palace, Nhà số 2, Ngõ 2, Đường số 1, Thôn Đoài, Xã Vĩnh Thanh, TP. Hà Nội'
    );
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2200);
  };

  return (
    <div className="relative min-h-screen bg-[#F8F5F4] text-[#3A2A2B]">
      {/* 1. SHOW-STOPPING 3D ENVELOPE OVERLAY */}
      {showEnvelope && (
        <EnvelopeScreen
          isOpenState={showEnvelope}
          onOpenComplete={() => setShowEnvelope(false)}
          onClose={() => setShowEnvelope(false)}
        />
      )}

      {/* Floating controls for music, replay envelope, rsvp, gift */}
      <FloatingNav
        onReopenEnvelope={() => setShowEnvelope(true)}
        onOpenGiftModal={() => setShowGiftModal(true)}
        onScrollToWishes={scrollToWishes}
        onOpenCalendar={scrollToCalendar}
      />

      {/* Gift / Mừng Cưới Modal */}
      <GiftModal isOpen={showGiftModal} onClose={() => setShowGiftModal(false)} />

      {/* Photo Lightbox */}
      <PhotoLightbox
        images={galleryImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
      />

      {/* ========================================================
          HERO SECTION (ELEGANT BURGUNDY ROMANCE)
      ======================================================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden py-20 px-4">
        {/* Background romantic photo + overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
            alt="Wedding Cover"
            className="w-full h-full object-cover brightness-[0.45] scale-105 filter blur-[0.6px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A0E17]/80 via-[#32070D]/75 to-[#1E0407]/90" />
        </div>

        {/* Calla Lily Flower Accent */}
        <img
          src="/images/hoa-rum.png"
          alt="Hoa Rum"
          className="absolute top-6 left-4 sm:left-12 w-24 sm:w-36 opacity-35 pointer-events-none drop-shadow-xl"
        />

        {/* Envelope Quick Trigger Pill */}
        <div className="relative z-10 mb-6">
          <button
            onClick={() => setShowEnvelope(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs tracking-wider uppercase backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
          >
            <span>💌 Chạm để mở lại phong bì</span>
          </button>
        </div>

        {/* Hero typography */}
        <div className="relative z-10 px-4 max-w-xl mx-auto flex flex-col items-center text-white">
          <p className="font-sans text-xs sm:text-sm tracking-[0.35em] uppercase text-amber-200/90 font-medium mb-3 drop-shadow reveal">
            Save The Date
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight uppercase drop-shadow-lg leading-tight reveal delay-100">
            HỒNG QUÂN <br />
            <span className="font-script text-5xl sm:text-7xl font-normal text-amber-200 lowercase tracking-normal block -my-2 sm:-my-4">
              &amp;
            </span>
            THU HIỀN
          </h1>

          <div className="mt-5 flex items-center justify-center gap-3 text-sm sm:text-base font-serif tracking-widest text-white/95 border-t border-b border-amber-200/40 py-2.5 px-6 reveal delay-200">
            <span>16:00</span>
            <span>•</span>
            <span className="font-bold text-amber-200 text-lg">28 . 11 . 2026</span>
            <span>•</span>
            <span>THỨ BẢY</span>
          </div>

          <p className="font-serif italic text-amber-100/90 text-sm mt-3 tracking-wide reveal delay-300">
            (Tức ngày 20 tháng 10 năm Bính Ngọ)
          </p>

          {/* Countdown timer / Milestone counter */}
          <div className="mt-8 bg-black/35 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 w-full max-w-md shadow-2xl reveal delay-300">
            <div className="text-[11px] uppercase tracking-[0.25em] text-amber-200 font-sans mb-3 font-semibold">
              {countdown.isPast ? 'Ngày chung đôi thiêng liêng' : 'Đếm ngược đến ngày hạnh phúc'}
            </div>

            {!countdown.isPast ? (
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="bg-white/10 rounded-xl p-2 border border-white/10">
                  <span className="block font-display font-bold text-xl sm:text-2xl text-white">
                    {countdown.days}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70">Ngày</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2 border border-white/10">
                  <span className="block font-display font-bold text-xl sm:text-2xl text-white">
                    {countdown.hours}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70">Giờ</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2 border border-white/10">
                  <span className="block font-display font-bold text-xl sm:text-2xl text-white">
                    {countdown.minutes}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70">Phút</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2 border border-white/10">
                  <span className="block font-display font-bold text-xl sm:text-2xl text-amber-300">
                    {countdown.seconds}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/70">Giây</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-200/95 italic font-serif">
                ♥ Đã cùng nhau sẻ chia hơn {countdown.daysSince.toLocaleString('vi-VN')} ngày ngọt ngào!
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-xs font-serif text-white/80">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-300" /> White Palace, Hà Nội
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator with drip animation from Duc Manh */}
        <div className="relative z-10 mt-10 flex flex-col items-center gap-2 text-white/75 text-xs uppercase tracking-[0.2em] reveal delay-400">
          <div className="w-[1.5px] h-8 bg-gradient-to-b from-white/90 to-transparent animate-drip" />
          <span>Cuộn xuống</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-amber-200" />
        </div>
      </section>

      {/* ========================================================
          SECTION 2: MONOGRAM & 3 IMAGES & BIG DATE (28 11 26)
      ======================================================== */}
      <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
        {/* Flower watermark */}
        <img
          src="/images/hoa-rum.png"
          alt="Decor"
          className="absolute -right-8 top-10 w-28 opacity-25 pointer-events-none reveal delay-200"
        />

        <div className="max-w-xl mx-auto text-center">
          {/* Monogram */}
          <div className="font-display text-5xl sm:text-6xl text-[#7A1C29] font-bold tracking-wider reveal">
            Q <span className="font-script text-5xl sm:text-6xl text-[#C48B92] font-normal mx-0.5">&amp;</span> H
          </div>
          <p className="font-serif italic text-base sm:text-lg text-[#3A2A2B]/85 mt-4 max-w-md mx-auto leading-relaxed reveal delay-100">
            “We step into a new chapter together, hand in hand, ready to build our home and embrace a lifetime of love.”
          </p>
          <p className="font-serif text-sm text-[#7A1C29] font-semibold mt-2 reveal delay-200">
            — Bước vào một chương mới, cùng nắm tay xây đắp tổ ấm trọn vẹn —
          </p>

          {/* 3 Photos Gallery with "28 11 26" */}
          <div className="relative mt-10 grid grid-cols-3 gap-2.5 sm:gap-4 reveal delay-300">
            {[galleryImages[1], galleryImages[2], galleryImages[3]].map((img, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIndex(idx + 1)}
                className="group relative aspect-1/2 rounded-xl overflow-hidden shadow-lg border border-[#7A1C29]/15 cursor-pointer transform hover:-translate-y-1 transition-all duration-500"
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>
            ))}

            {/* Big Date Overlay: 28 11 26 from Duc Manh */}
            <div className="absolute bottom-4 inset-x-0 flex justify-around items-center pointer-events-none font-display text-4xl sm:text-5xl font-bold text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              <span>28</span>
              <span>11</span>
              <span>26</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 italic mt-3 reveal delay-300">Chạm vào ảnh để phóng to xem rõ nét</p>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: CALENDAR (NOVEMBER 2026) & PARENTS
      ======================================================== */}
      <section
        ref={calendarRef}
        className="py-16 sm:py-20 px-4 bg-[#F3EFEA] border-y border-[#7A1C29]/10 relative"
      >
        <div className="max-w-xl mx-auto text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#7A1C29] font-semibold reveal">
            Save Our Date
          </p>
          <h2 className="font-script text-5xl sm:text-6xl text-[#7A1C29] mt-1 reveal delay-100">November</h2>
          <p className="text-xs uppercase tracking-widest text-stone-500 font-sans mt-0.5 reveal delay-100">Năm 2026</p>

          {/* Calendar Grid for November 2026 (Nov 1 is Sunday) */}
          <div className="mt-8 max-w-xs mx-auto bg-white p-6 rounded-2xl shadow-md border border-[#7A1C29]/15 reveal delay-200">
            <div className="grid grid-cols-7 text-center text-xs font-serif gap-y-3 font-semibold text-stone-600">
              <div className="text-[#C48B92]">HAI</div>
              <div className="text-[#C48B92]">BA</div>
              <div className="text-[#C48B92]">TƯ</div>
              <div className="text-[#C48B92]">NĂM</div>
              <div className="text-[#C48B92]">SÁU</div>
              <div className="text-[#C48B92]">BẢY</div>
              <div className="text-[#C48B92]">CN</div>

              {/* In Nov 2026: 1st is Sunday (column 7) */}
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div>1</div>

              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
              <div>6</div>
              <div>7</div>
              <div>8</div>

              <div>9</div>
              <div>10</div>
              <div>11</div>
              <div>12</div>
              <div>13</div>
              <div>14</div>
              <div>15</div>

              <div>16</div>
              <div>17</div>
              <div>18</div>
              <div>19</div>
              <div>20</div>
              <div>21</div>
              <div>22</div>

              <div>23</div>
              <div>24</div>
              <div>25</div>
              <div>26</div>
              <div>27</div>
              {/* Highlighted 28th (Saturday) */}
              <div className="relative flex items-center justify-center font-bold text-white">
                <span className="relative z-10">28</span>
                <Heart className="absolute inset-0 m-auto w-8 h-8 fill-[#7A1C29] text-[#7A1C29] animate-pulse" />
              </div>
              <div>29</div>

              <div>30</div>
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>

            {/* Quick Actions to add to calendar */}
            <div className="mt-6 pt-5 border-t border-stone-200/80 flex items-center justify-center gap-3">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#7A1C29] hover:bg-[#5C1A23] text-white text-xs font-serif transition-all cursor-pointer shadow-sm"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Google Lịch
              </a>
              <button
                onClick={downloadIcsFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-serif transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                Tải file .ics
              </button>
            </div>
          </div>

          {/* Parents Section from Duc Manh */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto text-center reveal delay-300">
            <div className="p-4 rounded-xl bg-white/70 border border-[#7A1C29]/10 shadow-sm">
              <h4 className="font-serif font-bold text-[#7A1C29] text-base tracking-wide uppercase mb-1">
                NHÀ GÁI
              </h4>
              <p className="font-serif text-sm text-[#3A2A2B] leading-relaxed">
                Ông: <strong className="text-stone-900">Hoàng Hữu Cường</strong>
                <br />
                Bà: <strong className="text-stone-900">Hoàng Thị Thúy Nga</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/70 border border-[#7A1C29]/10 shadow-sm">
              <h4 className="font-serif font-bold text-[#7A1C29] text-base tracking-wide uppercase mb-1">
                NHÀ TRAI
              </h4>
              <p className="font-serif text-sm text-[#3A2A2B] leading-relaxed">
                Ông: <strong className="text-stone-900">Lê Bá Kiên</strong>
                <br />
                Bà: <strong className="text-stone-900">Lê Thị Bình</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4: WEDDING DETAILS & VENUE (WHITE PALACE)
      ======================================================== */}
      <section className="py-16 sm:py-24 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7A1C29] font-medium font-sans reveal">
            Trân trọng báo tin lễ thành hôn của
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#7A1C29] mt-2 tracking-wide reveal delay-100">
            HỒNG QUÂN <br />
            <span className="font-script text-4xl sm:text-5xl text-[#C48B92] font-normal block my-1">
              &amp;
            </span>
            THU HIỀN
          </h2>

          <div className="my-8 py-6 px-4 bg-white/80 rounded-2xl border border-[#7A1C29]/15 shadow-sm reveal delay-200">
            <p className="font-serif font-bold text-lg sm:text-xl text-[#7A1C29] tracking-wider">
              16:00 • THỨ BẢY
            </p>
            <div className="flex items-center justify-center gap-4 my-2 text-base font-bold text-[#7A1C29]">
              <span className="uppercase tracking-widest text-xs sm:text-sm text-stone-600 font-sans">
                Tháng 11
              </span>
              <span className="font-display text-5xl sm:text-6xl font-bold text-[#7A1C29] leading-none">
                28
              </span>
              <span className="uppercase tracking-widest text-xs sm:text-sm text-stone-600 font-sans">
                Năm 2026
              </span>
            </div>
            <p className="font-serif italic text-stone-600 text-sm mt-2">
              (Tức ngày 20 tháng 10 năm Bính Ngọ)
            </p>
          </div>

          {/* Venue Card from Duc Manh */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#7A1C29]/20 shadow-md reveal delay-300">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-sans">
              Hôn lễ được tổ chức tại
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#3A2A2B] mt-2 mb-3">
              WHITE PALACE
            </h3>
            <p className="font-serif text-sm sm:text-base text-stone-700 leading-relaxed max-w-md mx-auto">
              Nhà số 2, Ngõ 2, Đường số 1<br />
              Thôn Đoài, Xã Vĩnh Thanh, TP. Hà Nội
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://maps.google.com/?q=Thôn+Đoài+Xã+Vĩnh+Thanh+Hà+Nội"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7A1C29] hover:bg-[#5C1A23] text-white text-xs font-serif font-bold tracking-widest uppercase shadow-md transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                Xem chỉ đường Google Maps
              </a>
              <button
                onClick={copyVenueAddress}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-serif transition-all cursor-pointer"
              >
                {copiedAddress ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>Sao chép địa chỉ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5: TIMELINE (FROM DUC MANH)
      ======================================================== */}
      <section className="py-16 sm:py-24 px-4 bg-[#F3EFEA] border-y border-[#7A1C29]/10 relative overflow-hidden">
        <img
          src="/images/hoa-rum.png"
          alt="Hoa rum decor"
          className="absolute -top-6 -right-6 w-32 opacity-20 pointer-events-none reveal delay-300"
        />

        <div className="max-w-xl mx-auto">
          <h2 className="font-script text-5xl sm:text-6xl text-[#7A1C29] text-center mb-10 reveal">
            Timeline
          </h2>

          <div className="relative max-w-sm mx-auto py-4">
            {/* 14:00 - Left: RƯỚC DÂU */}
            <div className="relative w-1/2 pr-8 text-right border-r-2 border-[#7A1C29] pb-12 reveal delay-100">
              <div className="absolute top-1 -right-[7px] w-3 h-3 rounded-full bg-[#7A1C29] ring-4 ring-[#F3EFEA]" />
              <div className="font-display text-xl sm:text-2xl font-bold text-[#7A1C29]">14:00</div>
              <div className="font-serif font-bold text-sm tracking-wider uppercase text-stone-900 mt-1">
                RƯỚC DÂU
              </div>
              <p className="text-xs text-stone-600 italic mt-0.5">Nghi thức rước dâu &amp; lễ gia tiên</p>
              <span className="text-2xl mt-1 inline-block">💐</span>
            </div>

            {/* 17:00 - Right: LỄ THÀNH HÔN */}
            <div className="relative w-1/2 ml-auto pl-8 text-left border-l-2 border-[#7A1C29] pb-12 -mt-2 reveal delay-200">
              <div className="absolute top-1 -left-[7px] w-3 h-3 rounded-full bg-[#7A1C29] ring-4 ring-[#F3EFEA]" />
              <div className="font-display text-xl sm:text-2xl font-bold text-[#7A1C29]">17:00</div>
              <div className="font-serif font-bold text-sm tracking-wider uppercase text-stone-900 mt-1">
                LỄ THÀNH HÔN
              </div>
              <p className="text-xs text-stone-600 italic mt-0.5">Trao nhẫn &amp; cử hành hôn lễ</p>
              <span className="text-2xl mt-1 inline-block">💍</span>
            </div>

            {/* 17:30 - Left: KHAI TIỆC */}
            <div className="relative w-1/2 pr-8 text-right border-r-2 border-[#7A1C29] pb-12 -mt-2 reveal delay-300">
              <div className="absolute top-1 -right-[7px] w-3 h-3 rounded-full bg-[#7A1C29] ring-4 ring-[#F3EFEA]" />
              <div className="font-display text-xl sm:text-2xl font-bold text-[#7A1C29]">17:30</div>
              <div className="font-serif font-bold text-sm tracking-wider uppercase text-stone-900 mt-1">
                KHAI TIỆC
              </div>
              <p className="text-xs text-stone-600 italic mt-0.5">Dạ tiệc tri ân ấm cúng</p>
              <span className="text-2xl mt-1 inline-block">🍽️</span>
            </div>

            {/* 19:00 - Right: ÂM NHẠC */}
            <div className="relative w-1/2 ml-auto pl-8 text-left border-l-2 border-transparent pb-4 -mt-2 reveal delay-400">
              <div className="absolute top-1 -left-[7px] w-3 h-3 rounded-full bg-[#7A1C29] ring-4 ring-[#F3EFEA]" />
              <div className="font-display text-xl sm:text-2xl font-bold text-[#7A1C29]">19:00</div>
              <div className="font-serif font-bold text-sm tracking-wider uppercase text-stone-900 mt-1">
                ÂM NHẠC
              </div>
              <p className="text-xs text-stone-600 italic mt-0.5">Giai điệu tình yêu &amp; giao lưu</p>
              <span className="text-2xl mt-1 inline-block">🎵</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 6: DRESSCODE & ARTFUL PHOTO COLLAGE
      ======================================================== */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-script text-5xl sm:text-6xl text-[#7A1C29] mb-4 reveal">Dresscode</h2>
          <p className="font-serif text-sm text-stone-600 max-w-sm mx-auto mb-6 reveal delay-100">
            Để những bức ảnh kỷ niệm thêm phần hài hòa và trọn vẹn, quý khách có thể ưu tiên trang phục theo các gam màu:
          </p>

          {/* Swatches from Duc Manh (#7A1C29, #C48B92, #E8D8D3, #9C7664) */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 my-6 reveal delay-200">
            <div className="flex flex-col items-center gap-1.5 transform hover:scale-110 transition-transform">
              <div className="w-12 h-12 rounded-full shadow-md border-2 border-white ring-2 ring-[#7A1C29]/30 bg-[#7A1C29]" />
              <span className="text-[10px] font-sans text-stone-600 font-medium">Đỏ Burgundy</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 transform hover:scale-110 transition-transform">
              <div className="w-12 h-12 rounded-full shadow-md border-2 border-white ring-2 ring-stone-200 bg-[#C48B92]" />
              <span className="text-[10px] font-sans text-stone-600 font-medium">Hồng Đất</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 transform hover:scale-110 transition-transform">
              <div className="w-12 h-12 rounded-full shadow-md border-2 border-white ring-2 ring-stone-200 bg-[#E8D8D3]" />
              <span className="text-[10px] font-sans text-stone-600 font-medium">Kem Be</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 transform hover:scale-110 transition-transform">
              <div className="w-12 h-12 rounded-full shadow-md border-2 border-white ring-2 ring-stone-200 bg-[#9C7664]" />
              <span className="text-[10px] font-sans text-stone-600 font-medium">Nâu Mocha</span>
            </div>
          </div>

          {/* Artful Photo Collage ("OUR Moments") */}
          <div className="mt-14 relative bg-[#F7F3EE] p-6 sm:p-8 rounded-3xl border border-[#7A1C29]/15 shadow-inner reveal delay-300">
            <div className="absolute top-3 left-4 font-script text-3xl sm:text-4xl text-[#7A1C29]/70">
              Forever
            </div>
            <div className="absolute bottom-4 right-4 font-script text-3xl sm:text-4xl text-[#7A1C29]/70">
              Love you
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div
                onClick={() => setLightboxIndex(4)}
                className="aspect-3/4 rounded-2xl overflow-hidden shadow-lg border-2 border-white cursor-pointer group transform hover:-rotate-1 transition-transform"
              >
                <img
                  src={galleryImages[4].src}
                  alt={galleryImages[4].caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div
                  onClick={() => setLightboxIndex(5)}
                  className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white cursor-pointer group transform hover:rotate-1 transition-transform"
                >
                  <img
                    src={galleryImages[5].src}
                    alt={galleryImages[5].caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="bg-[#7A1C29] text-white p-4 rounded-2xl text-center shadow-md">
                  <span className="font-sans text-[11px] tracking-[0.25em] uppercase text-amber-200 block">
                    OUR
                  </span>
                  <span className="font-script text-3xl sm:text-4xl">Moments</span>
                </div>
              </div>
            </div>

            <p className="font-serif italic text-stone-600 text-xs sm:text-sm mt-6">
              A collection of memories we've shared together
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 7: GUESTBOOK & RSVP (SỔ LƯU BÚT & XÁC NHẬN)
      ======================================================== */}
      <section
        ref={formRef}
        className="py-16 sm:py-24 px-4 bg-[#FAF7F5] border-t border-[#7A1C29]/10"
      >
        <div className="max-w-xl mx-auto text-center">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#7A1C29] font-semibold reveal">
            RSVP &amp; Guestbook
          </p>
          <h2 className="font-script text-5xl sm:text-6xl text-[#7A1C29] mt-1 mb-3 reveal delay-100">
            Sổ Lưu Bút &amp; Xác Nhận
          </h2>
          <p className="font-serif text-sm sm:text-base text-stone-600 mb-8 max-w-md mx-auto leading-relaxed reveal delay-200">
            Vui lòng xác nhận sự tham dự của bạn để chúng mình chuẩn bị đón tiếp một cách chu đáo nhất.
            Trân trọng cảm ơn!
          </p>

          {/* Form matching Duc Manh input fields */}
          <form
            onSubmit={handleSubmitWish}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#7A1C29]/20 text-left space-y-4 reveal delay-200"
          >
            {/* Guest Name */}
            <div>
              <label
                htmlFor="guestName"
                className="block text-xs font-serif font-bold text-stone-700 uppercase tracking-wider mb-1.5"
              >
                Họ và tên của bạn *
              </label>
              <input
                id="guestName"
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nhập tên của bạn hoặc gia đình"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-[#7A1C29] focus:ring-1 focus:ring-[#7A1C29] outline-none font-serif text-base bg-stone-50/50"
              />
            </div>

            {/* Guest Wish */}
            <div>
              <label
                htmlFor="guestWish"
                className="block text-xs font-serif font-bold text-stone-700 uppercase tracking-wider mb-1.5"
              >
                Gửi lời chúc đến cô dâu chú rể *
              </label>
              <textarea
                id="guestWish"
                rows={3}
                required
                value={guestWish}
                onChange={(e) => setGuestWish(e.target.value)}
                placeholder="Gửi gắm những lời chúc phúc ngọt ngào nhất..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-[#7A1C29] focus:ring-1 focus:ring-[#7A1C29] outline-none font-serif text-base bg-stone-50/50"
              />
            </div>

            {/* Attendance & Plus-One & Guest Of Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="attendance"
                  className="block text-xs font-serif font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                >
                  Xác nhận tham dự? *
                </label>
                <select
                  id="attendance"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#7A1C29] outline-none font-serif text-sm bg-stone-50/50 cursor-pointer font-semibold text-[#7A1C29]"
                >
                  <option value="Tham dự">Sẽ tham gia</option>
                  <option value="Không tham dự">Rất tiếc không thể đến</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="plusOne"
                  className="block text-xs font-serif font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                >
                  Bạn tham dự cùng ai?
                </label>
                <select
                  id="plusOne"
                  value={plusOne}
                  onChange={(e) => setPlusOne(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#7A1C29] outline-none font-serif text-sm bg-stone-50/50 cursor-pointer"
                >
                  <option value="Đi 1 mình">Đi 1 mình</option>
                  <option value="Đi cùng 1 người">Đi cùng 1 người</option>
                  <option value="Đi cùng gia đình">Đi cùng gia đình</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="guestOf"
                  className="block text-xs font-serif font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                >
                  Bạn là khách mời của ai?
                </label>
                <select
                  id="guestOf"
                  value={guestOf}
                  onChange={(e) => setGuestOf(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#7A1C29] outline-none font-serif text-sm bg-stone-50/50 cursor-pointer"
                >
                  <option value="Nhà trai">Nhà trai (Hồng Quân)</option>
                  <option value="Nhà gái">Nhà gái (Thu Hiền)</option>
                  <option value="Cả hai">Bạn chung cả hai</option>
                </select>
              </div>
            </div>

            {/* Photo upload for Canvas keepsake */}
            <div>
              <label className="block text-xs font-serif font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                📸 Tải lên ảnh / Sticker (Tùy chọn)
              </label>
              <label
                htmlFor="guestImage"
                className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-[#7A1C29]/30 hover:border-[#7A1C29] rounded-xl cursor-pointer bg-stone-50/70 hover:bg-stone-50 transition-all text-sm font-serif text-[#7A1C29]"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {guestImageFile ? guestImageFile.name : 'Chạm để tải ảnh / thiệp lưu niệm'}
                </span>
              </label>
              <input
                id="guestImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {guestImagePreview && (
                <div className="mt-2 flex items-center gap-3 bg-stone-100 p-2 rounded-lg">
                  <img
                    src={guestImagePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded border border-stone-300"
                  />
                  <div className="text-xs text-stone-600">
                    <p className="font-semibold text-stone-800">Đã chọn ảnh kỷ niệm</p>
                    <p className="text-[11px] text-stone-500">Ảnh sẽ được lồng vào thiệp chúc 1080x1080</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#7A1C29] hover:bg-[#5C1A23] active:scale-[0.99] text-white font-serif font-bold text-base tracking-widest uppercase shadow-lg shadow-[#7A1C29]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang xử lý tạo thiệp...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>XÁC NHẬN</span>
                </>
              )}
            </button>
          </form>

          {/* Keepsake Preview Modal / Download if generated */}
          {submitSuccess && generatedCardUrl && (
            <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#7A1C29]">
                Xác nhận thành công! Cảm ơn bạn rất nhiều.
              </h3>
              <p className="font-serif text-sm text-stone-600 mt-1">
                Thiệp chúc kỷ niệm riêng của bạn dành cho Hồng Quân &amp; Thu Hiền:
              </p>

              <div className="mt-4 max-w-xs mx-auto shadow-md rounded-xl overflow-hidden border border-stone-200">
                <img src={generatedCardUrl} alt="Wedding Keepsake Card" className="w-full h-auto" />
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <a
                  href={generatedCardUrl}
                  download={`Thiep-chuc-HongQuan-ThuHien-${guestName.replace(/\s+/g, '_')}.jpg`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A1C29] text-white text-xs font-serif font-semibold shadow hover:bg-[#5C1A23] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Tải thiệp lưu niệm về máy
                </a>
              </div>
            </div>
          )}

          {/* List of heartfelt wishes */}
          <div className="mt-12 text-left">
            <h3 className="font-serif font-bold text-lg text-[#7A1C29] uppercase tracking-wider mb-4 text-center">
              Lời Chúc Từ Khách Quý ({wishes.length})
            </h3>
            <div className="space-y-3.5">
              {wishes.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-xl border border-[#7A1C29]/15 shadow-xs hover:border-[#7A1C29]/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-serif font-bold text-stone-900 text-sm">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-sans text-stone-400">{item.createdAt}</span>
                  </div>

                  <p className="font-serif italic text-stone-700 text-sm leading-relaxed mb-2.5">
                    “{item.wish}”
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-sans">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        item.attendance === 'Tham dự'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {item.attendance}
                    </span>
                    {item.plusOne && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {item.plusOne}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#7A1C29]">
                      Khách {item.guestOf}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER (MATCHING DUC MANH)
      ======================================================== */}
      <footer className="relative py-16 px-4 bg-[#32070D] text-white text-center overflow-hidden">
        <div className="max-w-md mx-auto relative z-10">
          <p className="font-serif text-sm sm:text-base text-stone-300 leading-relaxed reveal">
            Hẹn gặp bạn trong ngày đặc biệt nhất của chúng mình.
            <br />
            Sẽ thật hạnh phúc khi có bạn ở đó cùng sẻ chia niềm vui và chứng kiến khoảnh khắc ý nghĩa này.
          </p>

          <div className="font-script text-4xl sm:text-5xl text-amber-200 mt-6 reveal delay-100">
            Thank you with love!
          </div>

          <div className="font-display font-bold text-xs uppercase tracking-[0.3em] text-white/70 mt-3 reveal delay-200">
            Hồng Quân &amp; Thu Hiền • 28.11.2026
          </div>
        </div>
      </footer>
    </div>
  );
}
