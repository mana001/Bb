/**
 * Audio Engine for Behind The Doodles Visual Novel.
 * Handles background music, ducking effects, camera shutter, and glitch audio.
 */

const cameraShutterAudioSrc = '/audio/irinairinafomicheva-camera-13695.mp3';
const cafeMusicAudioSrc = '/audio/paulyudin-cafe-cafe-music-607616.mp3';
const starostinIntroAudioSrc = '/audio/starostin-tv-show-intro-introduction-music-263127.mp3';
const sneakyAdventureAudioSrc = '/audio/Sneaky-Adventure(chosic.com).mp3';
const sneakySnitchAudioSrc = '/audio/Sneaky-Snitch(chosic.com).mp3';
const cricketAudioSrc = '/audio/natural_things-cricket-357579.mp3';
const comedyCartoonAudioSrc = '/audio/comedy-cartoon-funny-background-music-492540.mp3';
const gr0zaIntroAudioSrc = '/audio/gr0za-tv-show-intro-music-573319.mp3';
const jazzAudioSrc = '/audio/mixkit-upbeat-jazz-644.mp3';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private cameraAudio: HTMLAudioElement | null = null;
  private cafeAudio: HTMLAudioElement | null = null;
  private jazzAudio: HTMLAudioElement | null = null;
  private isJazzPlaying: boolean = false;
  private introBgmAudio: HTMLAudioElement | null = null;
  private introBgmVolume: number = 0.3;
  private isStarostinPlaying: boolean = false;
  private sneakyAudio: HTMLAudioElement | null = null;
  private isSneakyPlaying: boolean = false;
  private sneakySnitchAudio: HTMLAudioElement | null = null;
  private isSneakySnitchPlaying: boolean = false;
  private cricketAudio: HTMLAudioElement | null = null;
  private isCricketPlaying: boolean = false;
  private comedyAudio: HTMLAudioElement | null = null;
  private isComedyPlaying: boolean = false;
  private gr0zaAudio: HTMLAudioElement | null = null;
  private isGr0zaPlaying: boolean = false;
  private duckTimer: number | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public unlockAudio() {
    this.initContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.cafeAudio) {
      this.cafeAudio.muted = muted;
      this.cafeAudio.volume = muted ? 0 : 0.2;
    }
    if (this.introBgmAudio) {
      if (!this.isStarostinPlaying) {
        this.introBgmAudio.muted = true;
        this.introBgmAudio.volume = 0;
      } else {
        this.introBgmAudio.muted = muted;
        this.introBgmAudio.volume = muted ? 0 : this.introBgmVolume;
      }
    }
    if (this.sneakyAudio) {
      if (!this.isSneakyPlaying) {
        this.sneakyAudio.muted = true;
        this.sneakyAudio.volume = 0;
      } else {
        this.sneakyAudio.muted = muted;
        this.sneakyAudio.volume = muted ? 0 : 0.91;
      }
    }
    if (this.sneakySnitchAudio) {
      if (!this.isSneakySnitchPlaying) {
        this.sneakySnitchAudio.muted = true;
        this.sneakySnitchAudio.volume = 0;
      } else {
        this.sneakySnitchAudio.muted = muted;
        this.sneakySnitchAudio.volume = muted ? 0 : 0.91;
      }
    }
    if (this.cricketAudio) {
      if (!this.isCricketPlaying) {
        this.cricketAudio.muted = true;
        this.cricketAudio.volume = 0;
      } else {
        this.cricketAudio.muted = muted;
        this.cricketAudio.volume = muted ? 0 : 0.70;
      }
    }
    if (this.comedyAudio) {
      if (!this.isComedyPlaying) {
        this.comedyAudio.muted = true;
        this.comedyAudio.volume = 0;
      } else {
        this.comedyAudio.muted = muted;
        this.comedyAudio.volume = muted ? 0 : 0.40;
      }
    }
    if (this.gr0zaAudio) {
      if (!this.isGr0zaPlaying) {
        this.gr0zaAudio.muted = true;
        this.gr0zaAudio.volume = 0;
      } else {
        this.gr0zaAudio.muted = muted;
        this.gr0zaAudio.volume = muted ? 0 : 0.45;
      }
    }
    if (this.jazzAudio) {
      if (!this.isJazzPlaying) {
        this.jazzAudio.muted = true;
        this.jazzAudio.volume = 0;
      } else {
        this.jazzAudio.muted = muted;
        this.jazzAudio.volume = muted ? 0 : 0.35;
      }
    }
    if (this.cameraAudio) {
      this.cameraAudio.muted = muted;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Upbeat Jazz music (mixkit-upbeat-jazz-644.mp3):
   * Plays during Intro 0 and Disclaimer.
   */
  public startJazzMusic(volume: number = 0.35) {
    try {
      if (typeof window === 'undefined') return;
      this.isJazzPlaying = true;
      if (!this.jazzAudio) {
        this.jazzAudio = new Audio(jazzAudioSrc);
        this.jazzAudio.loop = true;
      }
      this.jazzAudio.muted = this.isMuted;
      this.jazzAudio.volume = this.isMuted ? 0 : volume;

      const playPromise = this.jazzAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!this.isJazzPlaying && this.jazzAudio) {
              this.jazzAudio.pause();
              this.jazzAudio.volume = 0;
              this.jazzAudio.muted = true;
            }
          })
          .catch(() => {});
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopJazzMusic() {
    this.isJazzPlaying = false;
    try {
      if (this.jazzAudio) {
        this.jazzAudio.volume = 0;
        this.jazzAudio.muted = true;
        this.jazzAudio.pause();
        this.jazzAudio.currentTime = 0;
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('mixkit-upbeat-jazz-644')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
            a.currentTime = 0;
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Duck jazz music briefly when camera shutter snaps in Visual 2 (Group photo), then restore.
   */
  public duckJazzMusicForPhoto() {
    try {
      if (!this.jazzAudio || this.isMuted) return;

      if (this.duckTimer) {
        window.clearTimeout(this.duckTimer);
      }

      this.jazzAudio.volume = 0.05;

      this.duckTimer = window.setTimeout(() => {
        if (this.jazzAudio && !this.isMuted && this.isJazzPlaying) {
          this.jazzAudio.volume = 0.35;
        }
        this.duckTimer = null;
      }, 1300);
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Cafe music (paulyudin-cafe-cafe-music-607616.mp3):
   * Plays at 20% volume for Visual 1 and Visual 2.
   */
  public startCafeMusic() {
    try {
      if (typeof window === 'undefined') return;
      if (!this.cafeAudio) {
        this.cafeAudio = new Audio(cafeMusicAudioSrc);
        this.cafeAudio.loop = true;
      }
      this.cafeAudio.muted = this.isMuted;
      this.cafeAudio.volume = this.isMuted ? 0 : 0.2;

      if (this.cafeAudio.paused) {
        this.cafeAudio.play().catch(() => {});
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopCafeMusic() {
    try {
      if (this.duckTimer) {
        window.clearTimeout(this.duckTimer);
        this.duckTimer = null;
      }
      if (this.cafeAudio) {
        this.cafeAudio.pause();
        this.cafeAudio.currentTime = 0;
      }
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Duck cafe music briefly when camera shutter snaps, then restore to 20%.
   */
  public duckCafeMusicForPhoto() {
    try {
      if (!this.cafeAudio || this.isMuted) return;

      if (this.duckTimer) {
        window.clearTimeout(this.duckTimer);
      }

      // Briefly lower volume to 4%
      this.cafeAudio.volume = 0.04;

      // Restore back to 20% after camera sound finishes (~1.3s)
      this.duckTimer = window.setTimeout(() => {
        if (this.cafeAudio && !this.isMuted) {
          this.cafeAudio.volume = 0.2;
        }
        this.duckTimer = null;
      }, 1300);
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Starostin TV show intro music (starostin-tv-show-intro-introduction-music-263127.mp3):
   * - Starts from intro.mp4 (at 30% volume) through intro1 and intro2.
   * - Lowers to 4% volume after intro2 (Visual 3 through 55).
   * - MUST STOP during glitch.mp4 (scene-glitch).
   * - MUST STOP during Visual 6 and Visual 7 (Sneaky Adventure plays).
   * - Re-continues at Visual 8 at 4% volume.
   * - MUST STOP during Visual 9 (Sneaky Snitch plays at 00:01).
   * - MUST STOP during break1 (scene-break1).
   * - Re-continues after break1 (Visual 10 and 11) at 4%.
   */
  public playStarostinMusic(targetVolume: number = 0.04) {
    try {
      if (typeof window === 'undefined') return;
      this.isStarostinPlaying = true;
      this.introBgmVolume = targetVolume;

      if (!this.introBgmAudio) {
        this.introBgmAudio = new Audio(starostinIntroAudioSrc);
        this.introBgmAudio.loop = true;
      }
      this.introBgmAudio.muted = this.isMuted;
      this.introBgmAudio.volume = this.isMuted ? 0 : targetVolume;

      if (this.introBgmAudio.paused) {
        const playPromise = this.introBgmAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!this.isStarostinPlaying && this.introBgmAudio) {
                this.introBgmAudio.pause();
                this.introBgmAudio.volume = 0;
                this.introBgmAudio.muted = true;
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public setStarostinVolume(volume: number) {
    this.introBgmVolume = volume;
    if (this.introBgmAudio) {
      this.introBgmAudio.volume = this.isMuted ? 0 : volume;
    }
  }

  public pauseStarostinMusic() {
    this.isStarostinPlaying = false;
    try {
      if (this.introBgmAudio) {
        this.introBgmAudio.volume = 0;
        this.introBgmAudio.muted = true;
        this.introBgmAudio.pause();
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('starostin')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopStarostinMusic() {
    this.isStarostinPlaying = false;
    try {
      if (this.introBgmAudio) {
        this.introBgmAudio.volume = 0;
        this.introBgmAudio.muted = true;
        this.introBgmAudio.pause();
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('starostin')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  // Backward-compatible aliases
  public startStarostinIntroMusic() {
    this.playStarostinMusic(0.3);
  }

  public stopStarostinIntroMusic() {
    this.stopStarostinMusic();
  }

  /**
   * Sneaky Adventure music (Sneaky-Adventure(chosic.com).mp3):
   * Plays during Visual 6 and Visual 7.
   */
  public startSneakyAdventureMusic(volume: number = 0.91) {
    try {
      if (typeof window === 'undefined') return;
      this.isSneakyPlaying = true;
      if (!this.sneakyAudio) {
        this.sneakyAudio = new Audio(sneakyAdventureAudioSrc);
        this.sneakyAudio.loop = true;
      }
      this.sneakyAudio.muted = this.isMuted;
      this.sneakyAudio.volume = this.isMuted ? 0 : volume;

      const playPromise = this.sneakyAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!this.isSneakyPlaying && this.sneakyAudio) {
              this.sneakyAudio.pause();
              this.sneakyAudio.volume = 0;
              this.sneakyAudio.muted = true;
            }
          })
          .catch(() => {});
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopSneakyAdventureMusic() {
    this.isSneakyPlaying = false;
    try {
      if (this.sneakyAudio) {
        this.sneakyAudio.volume = 0;
        this.sneakyAudio.muted = true;
        this.sneakyAudio.pause();
        this.sneakyAudio.currentTime = 0;
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('Sneaky-Adventure')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
            a.currentTime = 0;
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Sneaky Snitch music (Sneaky-Snitch(chosic.com).mp3):
   * Starts playing at 00:01 of Visual 8, continues through Visual 9, stops at Break 1.
   */
  public startSneakySnitchMusic(volume: number = 0.91) {
    try {
      if (typeof window === 'undefined') return;
      this.isSneakySnitchPlaying = true;
      if (!this.sneakySnitchAudio) {
        this.sneakySnitchAudio = new Audio(sneakySnitchAudioSrc);
        this.sneakySnitchAudio.loop = true;
      }
      this.sneakySnitchAudio.muted = this.isMuted;
      this.sneakySnitchAudio.volume = this.isMuted ? 0 : volume;

      const playPromise = this.sneakySnitchAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!this.isSneakySnitchPlaying && this.sneakySnitchAudio) {
              this.sneakySnitchAudio.pause();
              this.sneakySnitchAudio.volume = 0;
              this.sneakySnitchAudio.muted = true;
            }
          })
          .catch(() => {});
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopSneakySnitchMusic() {
    this.isSneakySnitchPlaying = false;
    try {
      if (this.sneakySnitchAudio) {
        this.sneakySnitchAudio.volume = 0;
        this.sneakySnitchAudio.muted = true;
        this.sneakySnitchAudio.pause();
        this.sneakySnitchAudio.currentTime = 0;
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('Sneaky-Snitch')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
            a.currentTime = 0;
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Cricket chirp audio (cricket.mp3):
   * Plays during Visual 13 awkward pause.
   */
  public playCricketMusic(volume: number = 0.70) {
    try {
      if (typeof window === 'undefined') return;
      this.isCricketPlaying = true;
      if (!this.cricketAudio) {
        this.cricketAudio = new Audio(cricketAudioSrc);
        this.cricketAudio.loop = true;
      }
      this.cricketAudio.muted = this.isMuted;
      this.cricketAudio.volume = this.isMuted ? 0 : volume;

      const playPromise = this.cricketAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!this.isCricketPlaying && this.cricketAudio) {
              this.cricketAudio.pause();
              this.cricketAudio.volume = 0;
              this.cricketAudio.muted = true;
            }
          })
          .catch(() => {});
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopCricketMusic() {
    this.isCricketPlaying = false;
    try {
      if (this.cricketAudio) {
        this.cricketAudio.volume = 0;
        this.cricketAudio.muted = true;
        this.cricketAudio.pause();
        this.cricketAudio.currentTime = 0;
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('cricket')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
            a.currentTime = 0;
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Comedy Cartoon background music (comedy-cartoon-funny-background-music-492540.mp3):
   * Plays during Behind The Scenes (Visual 44 through Visual 58).
   */
  public startComedyMusic(volume: number = 0.40) {
    try {
      if (typeof window === 'undefined') return;
      this.isComedyPlaying = true;
      if (!this.comedyAudio) {
        this.comedyAudio = new Audio(comedyCartoonAudioSrc);
        this.comedyAudio.loop = true;
      }
      this.comedyAudio.muted = this.isMuted;
      this.comedyAudio.volume = this.isMuted ? 0 : volume;

      const playPromise = this.comedyAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!this.isComedyPlaying && this.comedyAudio) {
              this.comedyAudio.pause();
              this.comedyAudio.volume = 0;
              this.comedyAudio.muted = true;
            }
          })
          .catch(() => {});
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopComedyMusic() {
    this.isComedyPlaying = false;
    try {
      if (this.comedyAudio) {
        this.comedyAudio.volume = 0;
        this.comedyAudio.muted = true;
        this.comedyAudio.pause();
        this.comedyAudio.currentTime = 0;
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('comedy-cartoon-funny-background-music')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
            a.currentTime = 0;
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * gr0za-tv-show-intro-music (gr0za-tv-show-intro-music-573319.mp3):
   * Plays starting from Visual 80 through the finale sequence.
   */
  public startGr0zaMusic(volume: number = 0.45) {
    try {
      if (typeof window === 'undefined') return;
      this.isGr0zaPlaying = true;
      if (!this.gr0zaAudio) {
        this.gr0zaAudio = new Audio(gr0zaIntroAudioSrc);
        this.gr0zaAudio.loop = true;
      }
      this.gr0zaAudio.muted = this.isMuted;
      this.gr0zaAudio.volume = this.isMuted ? 0 : volume;

      const playPromise = this.gr0zaAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!this.isGr0zaPlaying && this.gr0zaAudio) {
              this.gr0zaAudio.pause();
              this.gr0zaAudio.volume = 0;
              this.gr0zaAudio.muted = true;
            }
          })
          .catch(() => {});
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public stopGr0zaMusic() {
    this.isGr0zaPlaying = false;
    try {
      if (this.gr0zaAudio) {
        this.gr0zaAudio.volume = 0;
        this.gr0zaAudio.muted = true;
        this.gr0zaAudio.pause();
        this.gr0zaAudio.currentTime = 0;
      }
      if (typeof document !== 'undefined') {
        const audios = document.querySelectorAll('audio');
        audios.forEach((a) => {
          if (a.src && a.src.includes('gr0za')) {
            a.volume = 0;
            a.muted = true;
            a.pause();
            a.currentTime = 0;
          }
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * High-intensity digital glitch sound effect.
   * Plays ONLY during the glitch effect between Visual 1 and Visual 2.
   */
  public playGlitchTransition() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Noise burst for electric glitch static
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Bit-stepped digital noise
        output[i] = (Math.random() * 2 - 1) * (i % 8 < 4 ? 0.8 : -0.8);
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Filter noise to sound like TV static / electro pulse
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.45);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.09, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.45);

      // 2. Glitched harmonic square-wave stutters
      const pitches = [180, 520, 240, 880, 110];
      pitches.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        const start = now + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.setValueAtTime(freq * 1.5, start + 0.04);

        oscGain.gain.setValueAtTime(0.05, start);
        oscGain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch {
      // Audio error safe ignore
    }
  }

  /**
   * Authentic camera shutter sound using user-provided irinairinafomicheva-camera-13695.mp3
   */
  public playCameraShutter() {
    if (this.isMuted) return;
    try {
      if (typeof window === 'undefined') return;
      this.initContext();
      if (!this.cameraAudio) {
        this.cameraAudio = new Audio(cameraShutterAudioSrc);
      }
      this.cameraAudio.currentTime = 0;
      this.cameraAudio.muted = false;
      this.cameraAudio.volume = 1.0;
      const promise = this.cameraAudio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Fallback to fresh audio element if play was rejected
          const fresh = new Audio(cameraShutterAudioSrc);
          fresh.volume = 1.0;
          fresh.play().catch(() => {});
        });
      }
    } catch {
      // Audio error safe ignore
    }
  }

  public playTypewriterBlip() {
    // Sound disabled: only designated music & glitch have sound
  }

  public playAdvance() {
    // Sound disabled: only designated music & glitch have sound
  }

  public playSceneSwap() {
    // Sound disabled: only designated music & glitch have sound
  }

  public playWindowClick() {
    // Sound disabled: only designated music & glitch have sound
  }
}

export const retroAudio = new RetroAudioEngine();
