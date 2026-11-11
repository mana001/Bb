import React from 'react';

interface PixelWindowProps {
  title?: string;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  children: React.ReactNode;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  isCrtEnabled: boolean;
  onToggleCrt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHistory: () => void;
  onOpenVisualLog?: () => void;
  onPrev?: () => void;
  canPrev?: boolean;
  isGlitching: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const PixelWindow: React.FC<PixelWindowProps> = ({
  title = 'BEHIND_THE_DOODLES.EXE · Visual Novel Interface',
  isMinimized,
  onMinimize,
  onClose,
  children,
  isAutoPlay,
  onToggleAutoPlay,
  isCrtEnabled,
  onToggleCrt,
  isMuted,
  onToggleMute,
  onOpenHistory,
  onOpenVisualLog,
  onPrev,
  canPrev = false,
  isGlitching,
  isFullscreen = false,
  onToggleFullscreen,
  style,
  className = '',
}) => {
  return (
    <div
      style={style}
      className={`novel-window-frame relative flex flex-col border-2 border-[#4A2850] shadow-2xl bg-[#1A1624] text-[#FAF5FF] select-none overflow-hidden z-20 ${className}`}
    >
      {/* 1. TOP TITLE BAR & BUTTON STRIP */}
      <header className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-[#D8B4FE] via-[#FBCFE8] to-[#DDD6FE] border-b-2 border-[#4A2850] text-xs font-mono tracking-wider shadow-sm select-none z-30 shrink-0 w-full">
        {/* Left: Window Icon + Title */}
        <div className="flex items-center gap-2 truncate">
          <svg
            className="w-4 h-4 text-[#4C286A] shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 2h2v2H3V2zm6 0h2v2H9V2zM1 4h2v2H1V4zm10 0h2v2h-2V4zM0 6h3v4H0V6zm11 0h3v4h-3V6zm-5 1h2v6H6V7zm-3 2h2v2H3V9zm6 0h2v2H9V9zm-4 4h4v2H5v-2z"
            />
          </svg>
          <span className="font-bold text-[#341F48] uppercase tracking-widest truncate font-pixel">
            {title}
          </span>
        </div>

        {/* Center: Essential Utility Controls Button Strip */}
        <div className="flex items-center gap-2 text-[11px] pl-2">
          {/* Auto-Play Toggle */}
          <button
            onClick={onToggleAutoPlay}
            disabled={isGlitching}
            className={`px-2 py-0.5 pixel-pastel-button flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer ${
              isAutoPlay
                ? 'bg-[#A7F3D0] text-[#065F46] border border-[#065F46]'
                : 'bg-[#FAF5FF] text-[#4C2E6B] hover:bg-[#F3E8FF]'
            }`}
            title="Toggle Auto-Play dialogue"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              {isAutoPlay ? (
                <path d="M4 3h3v10H4V3zm5 0h3v10H9V3z" />
              ) : (
                <path d="M4 3l9 5-9 5V3z" />
              )}
            </svg>
            <span>{isAutoPlay ? 'AUTO: ON' : 'AUTO'}</span>
          </button>

          {/* Previous Node Button */}
          {onPrev && (
            <button
              onClick={onPrev}
              disabled={!canPrev || isGlitching}
              className={`px-2 py-0.5 pixel-pastel-button flex items-center gap-1 text-[11px] font-mono font-bold ${
                canPrev && !isGlitching
                  ? 'bg-[#FAF5FF] text-[#4C2E6B] hover:bg-[#F3E8FF] cursor-pointer'
                  : 'bg-white/40 text-black/30 cursor-not-allowed opacity-60'
              }`}
              title="Go back to previous line / scene (Left Arrow or Backspace)"
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10 3L4 8l6 5V3z" />
              </svg>
              <span>PREV</span>
            </button>
          )}

          {/* Visual Selector / Scene Log */}
          {onOpenVisualLog && (
            <button
              onClick={onOpenVisualLog}
              className="px-2 py-0.5 pixel-pastel-button bg-[#FAF5FF] text-[#4C2E6B] hover:bg-[#F3E8FF] flex items-center gap-1 text-[11px] font-mono font-bold shadow-xs cursor-pointer border border-[#824B85]/40"
              title="Open Visual Scene Selector Log"
            >
              <svg className="w-3 h-3 text-[#824B85]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
              </svg>
              <span>VISUALS</span>
            </button>
          )}

          {/* Dialogue Log Backlog */}
          <button
            onClick={onOpenHistory}
            className="px-2 py-0.5 pixel-pastel-button bg-[#FAF5FF] text-[#4C2E6B] hover:bg-[#F3E8FF] flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer"
            title="Open Dialogue History Log"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h8v2H2v-2z" />
            </svg>
            <span>LOG</span>
          </button>

          {/* CRT Filter */}
          <button
            onClick={onToggleCrt}
            className={`px-2 py-0.5 pixel-pastel-button flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer ${
              isCrtEnabled
                ? 'bg-[#E0E7FF] text-[#3730A3] border border-[#3730A3]'
                : 'bg-[#FAF5FF] text-[#4C2E6B] hover:bg-[#F3E8FF]'
            }`}
            title="Toggle Retro CRT Scanlines"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2h14v10H1V2zm2 2v6h10V4H3zm-2 9h14v1H1v-1z" />
            </svg>
            <span>CRT</span>
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={onToggleMute}
            className={`px-2 py-0.5 pixel-pastel-button flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer ${
              isMuted
                ? 'bg-[#FEE2E2] text-[#991B1B]'
                : 'bg-[#FEF3C7] text-[#92400E]'
            }`}
            title="Toggle Audio & Glitch Sound"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              {isMuted ? (
                <path d="M1 5h3l4-4v14l-4-4H1V5zm10 0l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="2" />
              ) : (
                <path d="M2 5h3l4-4v14l-4-4H2V5zm9 1a4 4 0 010 6m2-8a7 7 0 010 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
              )}
            </svg>
            <span>{isMuted ? 'MUTED' : 'SFX'}</span>
          </button>
        </div>

        {/* Far Right: Window Controls [Fullscreen] [-] and [×] */}
        <div className="flex items-center gap-1.5 pl-2">
          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="w-6 h-5 pixel-pastel-button bg-[#FAF5FF] hover:bg-[#E9D5FF] text-[#381E52] flex items-center justify-center font-bold text-xs cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M3 0h1v3H1V2h2V0zm4 0h1v2h2v1H7V0zM1 7h3v3H3V8H1V7zm8 1v2H7V7h3v1z" />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M0 0h3v1H1v2H0V0zm7 0h3v3H9V1H7V0zM0 7h1v2h2v1H0V7zm9 2V7h1v3H7V9h2z" />
                </svg>
              )}
            </button>
          )}

          {/* Minimize [-] */}
          <button
            onClick={onMinimize}
            className="w-6 h-5 pixel-pastel-button bg-[#FAF5FF] hover:bg-[#E9D5FF] text-[#381E52] flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Minimize Window [-]"
            aria-label="Minimize Window"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
              <rect y="7" width="10" height="2" />
            </svg>
          </button>

          {/* Close / Reset [×] */}
          <button
            onClick={onClose}
            className="w-6 h-5 pixel-pastel-button bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#831843] flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Restart Story [×]"
            aria-label="Close or Reset Story"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. MINIMIZED RESTORE STATE */}
      {isMinimized ? (
        <div className="flex flex-col items-center justify-center p-8 bg-[#211B30] text-center w-80 sm:w-96">
          <div className="p-6 bg-[#2B233D] border-2 border-[#D8B4FE] pixel-pastel-box w-full">
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-[#FBCFE8]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2h2v2H3V2zm6 0h2v2H9V2zM1 4h2v2H1V4zm10 0h2v2h-2V4zM0 6h3v4H0V6zm11 0h3v4h-3V6zm-5 1h2v6H6V7zm-3 2h2v2H3V9zm6 0h2v2H9V9zm-4 4h4v2H5v-2z" />
              </svg>
            </div>
            <h2 className="text-base font-mono font-bold text-[#F3E8FF] mb-1">
              SESSION MINIMIZED
            </h2>
            <p className="text-xs text-[#DDD6FE] mb-4 font-mono">
              Scene and dialogue position are saved in memory.
            </p>
            <button
              onClick={onMinimize}
              className="px-4 py-2 pixel-pastel-button bg-[#D8B4FE] hover:bg-[#C084FC] text-[#2E1840] font-mono text-xs uppercase tracking-wider font-bold w-full cursor-pointer"
            >
              Restore Visual Novel Window
            </button>
          </div>
        </div>
      ) : (
        /* SCENE & DIALOGUE CONTAINER */
        <div className="relative flex-1 w-full min-h-0 overflow-hidden flex flex-col bg-black">
          {children}
        </div>
      )}

      {/* CRT SCANLINE & VIGNETTE OVERLAYS (ONLY ACTIVE WHEN CRT TOGGLED ON) */}
      {isCrtEnabled && (
        <>
          <div className="absolute inset-0 crt-overlay pointer-events-none z-40" />
          <div className="absolute inset-0 crt-vignette pointer-events-none z-40" />
        </>
      )}
    </div>
  );
};
