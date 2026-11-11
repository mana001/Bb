/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PixelWindow } from './components/PixelWindow.tsx';
import { SceneDisplay } from './components/SceneDisplay.tsx';
import { HistoryModal } from './components/HistoryModal.tsx';
import { VisualLogModal } from './components/VisualLogModal.tsx';
import { GameLauncher } from './components/GameLauncher.tsx';
import { STORY_NODES, NOVEL_IMAGES } from './data/story.ts';
import { TextSpeed } from './types/novel.ts';
import { retroAudio } from './utils/sound.ts';

export default function App() {
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [nodeIndex, setNodeIndex] = useState<number>(0);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [textSpeed] = useState<TextSpeed>('instant');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isVisualLogOpen, setIsVisualLogOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  });

  const glitchTimerRef = useRef<number | null>(null);
  const lastAdvanceTimeRef = useRef<number>(0);

  // Dialogue backlog log
  const [historyLog, setHistoryLog] = useState<
    { speaker: string; text: string; sceneTitle: string; timestamp: string }[]
  >([]);

  const currentNode = STORY_NODES[nodeIndex] || STORY_NODES[0];

  const refreshViewport = useCallback(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Window resize, orientation, focus & visibility listeners
  useEffect(() => {
    refreshViewport();
    window.addEventListener('resize', refreshViewport);
    window.addEventListener('orientationchange', refreshViewport);
    window.addEventListener('focus', refreshViewport);
    document.addEventListener('visibilitychange', refreshViewport);
    return () => {
      window.removeEventListener('resize', refreshViewport);
      window.removeEventListener('orientationchange', refreshViewport);
      window.removeEventListener('focus', refreshViewport);
      document.removeEventListener('visibilitychange', refreshViewport);
    };
  }, [refreshViewport]);

  // Track Fullscreen state changes (e.g. user pressed Esc on keyboard)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Preload initial batch of images during splash launcher for instantaneous startup
  useEffect(() => {
    const startupImages = [
      NOVEL_IMAGES.in,
      NOVEL_IMAGES.intro0,
      NOVEL_IMAGES.novel1,
      NOVEL_IMAGES.novel2_png,
      NOVEL_IMAGES.novel2_1,
      NOVEL_IMAGES.intro1,
      NOVEL_IMAGES.intro2,
      NOVEL_IMAGES.butterfly,
    ];
    startupImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (typeof (img as any).decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  }, []);

  // Prevent pinch-to-zoom and gesture scaling on mobile devices
  useEffect(() => {
    const preventPinch = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventPinch, { passive: false });
    document.addEventListener('touchmove', preventPinch, { passive: false });
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventPinch);
      document.removeEventListener('touchmove', preventPinch);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // Touch device and orientation detection
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));

  // Determine if device is a mobile/touch device in portrait mode (width < height and width <= 850px)
  const isPhonePortrait =
    windowDimensions.width < windowDimensions.height &&
    (windowDimensions.width <= 850 || isTouchDevice);

  // Responsive 16:9 widescreen web novel reader container (modern CSS)
  const readerContainerStyle: React.CSSProperties = useMemo(() => ({
    aspectRatio: '16 / 9',
    width: 'min(calc(100dvh * (16 / 9)), 100dvw)',
    height: 'min(100dvh, calc(100dvw * (9 / 16)))',
    maxWidth: '100dvw',
    maxHeight: '100dvh',
  }), []);

  // Screen orientation lock helper (with vendor fallbacks)
  const lockLandscape = useCallback(async () => {
    try {
      const orientation = screen.orientation as any;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape').catch(() => {});
      } else if ((screen as any).lockOrientation) {
        (screen as any).lockOrientation('landscape');
      } else if ((screen as any).mozLockOrientation) {
        (screen as any).mozLockOrientation('landscape');
      } else if ((screen as any).msLockOrientation) {
        (screen as any).msLockOrientation('landscape');
      }
    } catch {
      // Ignored if unsupported on device (e.g. iOS Safari)
    }
  }, []);

  // itch.io Style Game Launch handler: Fullscreen + Landscape Lock + Audio Unlock
  const handleLaunchGame = useCallback(async () => {
    // 1. Trigger browser Fullscreen API
    try {
      const el = document.documentElement as any;
      if (el.requestFullscreen) {
        await el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked
    }

    // 2. Lock landscape orientation on mobile devices
    await lockLandscape();

    // 3. User interaction gesture unlocks audio
    retroAudio.unlockAudio();

    setIsLaunched(true);
    setIsFullscreen(true);
  }, [lockLandscape]);

  // Fullscreen toggle function for title bar & floating button
  const handleToggleFullscreen = useCallback(async () => {
    try {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      if (!isFull) {
        const el = document.documentElement as any;
        if (el.requestFullscreen) {
          await el.requestFullscreen().catch(() => {});
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
  }, []);

  // Record node to history backlog whenever node changes (only if it has text)
  useEffect(() => {
    if (!currentNode.dialogue || currentNode.dialogue.trim().length === 0) return;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setHistoryLog((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.text === currentNode.dialogue) return prev;
      return [
        ...prev,
        {
          speaker: currentNode.speaker,
          text: currentNode.dialogue,
          sceneTitle: currentNode.sceneTitle,
          timestamp: timeStr,
        },
      ];
    });
  }, [nodeIndex, currentNode]);

  // Clean up any glitch timer on unmount
  useEffect(() => {
    return () => {
      if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
    };
  }, []);

  // Advance sequence (Next) with debounce to prevent double-skips
  const handleAdvance = useCallback(() => {
    const now = Date.now();
    if (now - lastAdvanceTimeRef.current < 250) return;
    lastAdvanceTimeRef.current = now;

    if (isGlitching) return;

    if (currentNode.choices && currentNode.choices.length > 0) {
      return;
    }

    setNodeIndex((prev) => (prev < STORY_NODES.length - 1 ? prev + 1 : 0));
  }, [currentNode.choices, isGlitching]);

  // Go to previous sequence step (Prev)
  const handlePrev = useCallback(() => {
    if (isGlitching) return;
    setNodeIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, [isGlitching]);

  // Jump directly to specific node from Visual Log
  const handleJumpToNode = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < STORY_NODES.length) {
      setNodeIndex(targetIndex);
    }
  }, []);

  // Choice selection
  const handleSelectChoice = useCallback((targetNodeId: number) => {
    setNodeIndex(targetNodeId);
  }, []);

  // Window controls
  const handleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setNodeIndex(0);
    setIsAutoPlay(false);
    setIsGlitching(false);
  }, []);

  const handleToggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => !prev);
  }, []);

  const handleToggleCrt = useCallback(() => {
    setIsCrtEnabled((prev) => !prev);
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    retroAudio.setMuted(nextMuted);
  }, [isMuted]);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHistoryOpen || isVisualLogOpen) {
        if (e.key === 'Escape') {
          setIsHistoryOpen(false);
          setIsVisualLogOpen(false);
        }
        return;
      }

      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (currentNode.sceneId === 'scene-intro0') {
          return;
        }
        handleAdvance();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (currentNode.sceneId === 'scene-intro0') {
          return;
        }
        handlePrev();
      } else if (e.key.toLowerCase() === 'v') {
        setIsVisualLogOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'a') {
        handleToggleAutoPlay();
      } else if (e.key.toLowerCase() === 'c') {
        handleToggleCrt();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
      } else if (e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'h') {
        setIsHistoryOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance, handlePrev, handleToggleAutoPlay, handleToggleCrt, handleToggleMute, isHistoryOpen, isVisualLogOpen, currentNode.sceneId]);

  // If not launched, show Launcher
  if (!isLaunched) {
    return (
      <GameLauncher
        onLaunch={handleLaunchGame}
      />
    );
  }

  return (
    <div
      className="game-overlay-container fixed inset-0 w-screen h-screen overflow-hidden bg-[#07050D] select-none flex items-center justify-center"
    >
      {/* 1. STRICT PORTRAIT BLOCKER: DO NOT MOUNT OR START GAME IN PORTRAIT MODE ON PHONE */}
      {isPhonePortrait ? (
        <div className="fixed inset-0 z-50 bg-[#0A0713]/98 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-md">
          <div className="max-w-sm w-full bg-[#1A1424] border-2 border-[#824B85] p-6 pixel-corners-box shadow-2xl flex flex-col items-center">
            {/* Animated Rotating Phone SVG */}
            <div className="w-16 h-16 mb-4 relative flex items-center justify-center text-[#D8B4FE]">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
              </svg>
              <svg
                className="w-8 h-8 absolute -top-1 -right-1 text-[#FBCFE8] animate-spin"
                style={{ animationDuration: '3s' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </div>

            <div className="px-3 py-1 bg-[#824B85] text-[#FAF5FF] font-silkscreen text-xs font-bold tracking-widest uppercase pixel-corners-sm mb-3">
              PORTRAIT MODE DISABLED
            </div>

            <h2 className="text-[#FAF5FF] font-pixel text-lg font-bold mb-2">
              PLEASE ROTATE YOUR DEVICE
            </h2>

            <p className="text-[#D8B4FE] font-pixel text-xs leading-relaxed mb-5">
              BEHIND THE DOODLES is designed to be experienced in landscape orientation. Please rotate your phone horizontally to continue.
            </p>

            <button
              onClick={lockLandscape}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D8B4FE] to-[#FBCFE8] hover:from-[#C084FC] hover:to-[#F472B6] text-[#2E1230] font-silkscreen text-xs font-bold pixel-corners-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-[#2E1230]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 4h14v8H1V4zm1 1v6h12V5H2z" />
              </svg>
              <span>LOCK LANDSCAPE</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. RESPONSIVE 16:9 WIDESCREEN NOVEL WINDOW CONTAINER */
        <div className="flex items-center justify-center w-full h-full max-w-full max-h-full overflow-hidden p-0">
          <PixelWindow
            title="BEHIND_THE_DOODLES.EXE"
            isMinimized={isMinimized}
            onMinimize={handleMinimize}
            onClose={handleClose}
            isAutoPlay={isAutoPlay}
            onToggleAutoPlay={handleToggleAutoPlay}
            isCrtEnabled={isCrtEnabled}
            onToggleCrt={handleToggleCrt}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenVisualLog={() => setIsVisualLogOpen(true)}
            onPrev={handlePrev}
            canPrev={nodeIndex > 0 && currentNode.sceneId !== 'scene-intro0'}
            isGlitching={isGlitching}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            style={readerContainerStyle}
          >
            <SceneDisplay
              currentNode={currentNode}
              currentNodeIndex={nodeIndex}
              textSpeed={textSpeed}
              isAutoPlay={isAutoPlay}
              onAdvance={handleAdvance}
              onSelectChoice={handleSelectChoice}
              isGlitching={isGlitching}
              isMuted={isMuted}
            />
          </PixelWindow>

          {/* Visual Scene Navigator Log Modal */}
          <VisualLogModal
            isOpen={isVisualLogOpen}
            onClose={() => setIsVisualLogOpen(false)}
            currentNodeIndex={nodeIndex}
            onJumpToNode={handleJumpToNode}
          />

          {/* Backlog / Transcript Modal */}
          <HistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            entries={historyLog}
          />
        </div>
      )}

      {/* Floating re-enter fullscreen button if user exits fullscreen on desktop or mobile */}
      {!isPhonePortrait && !isFullscreen && (
        <button
          onClick={handleToggleFullscreen}
          className="fixed top-2 right-2 z-40 px-2.5 py-1 bg-[#140F20]/90 hover:bg-[#2A1530] border border-[#824B85] text-[#FAF5FF] font-pixel text-[11px] rounded-xs shadow-xl flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all active:scale-95"
          title="Re-enter Fullscreen"
        >
          <svg className="w-3 h-3 text-[#D8B4FE]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
          </svg>
          <span>FULLSCREEN</span>
        </button>
      )}
    </div>
  );
}
