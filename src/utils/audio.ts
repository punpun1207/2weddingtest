/**
 * Audio player for wedding invitation:
 * Plays the romantic song 'BanDoi.mp3' (from Duc Manh repo) with fallback to
 * Web Audio API romantic piano/celesta melody if audio file loading fails.
 */
class WeddingAudioPlayer {
  private audioElement: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timer: number | null = null;
  private noteIndex: number = 0;
  private useSynthFallback: boolean = false;

  // Gentle melody note frequencies (Canon in D arpeggios & romantic harmonies)
  private sequence: number[] = [
    293.66, 369.99, 440.00, 587.33, 440.00, 369.99,
    220.00, 277.18, 329.63, 440.00, 329.63, 277.18,
    246.94, 293.66, 369.99, 493.88, 369.99, 293.66,
    185.00, 220.00, 277.18, 369.99, 277.18, 220.00,
    196.00, 246.94, 293.66, 392.00, 293.66, 246.94,
    146.83, 220.00, 293.66, 369.99, 293.66, 220.00,
    196.00, 246.94, 293.66, 392.00, 493.88, 587.33,
    220.00, 277.18, 329.63, 440.00, 554.37, 659.25,
  ];

  public init() {
    if (typeof window === 'undefined') return;

    if (!this.audioElement) {
      try {
        const audio = new Audio('/music/BanDoi.mp3');
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0.85;
        this.audioElement = audio;

        audio.addEventListener('error', () => {
          this.useSynthFallback = true;
        });
      } catch {
        this.useSynthFallback = true;
      }
    }

    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public play() {
    this.init();
    this.isPlaying = true;

    if (this.audioElement && !this.useSynthFallback) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing
          })
          .catch(() => {
            // Autoplay policy or format error -> fallback to Web Audio
            this.playSynth();
          });
        return;
      }
    }

    this.playSynth();
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  private playSynth() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.scheduleNextNote();
  }

  private playTone(freq: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  private scheduleNextNote = () => {
    if (!this.isPlaying) return;
    const freq = this.sequence[this.noteIndex % this.sequence.length];
    this.playTone(freq);
    this.noteIndex++;
    this.timer = window.setTimeout(this.scheduleNextNote, 420);
  };
}

export const weddingAudio = new WeddingAudioPlayer();
