import React from 'react';
import { NOVEL_IMAGES } from '../data/story.ts';

interface GameLauncherProps {
  onLaunch: () => void;
  isLandscapeLocked?: boolean;
}

export const GameLauncher: React.FC<GameLauncherProps> = ({
  onLaunch,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07050D] text-[#FAF5FF] select-none overflow-hidden p-3 sm:p-6">
      {/* Cinematic 3D Ambient Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Conservatory Scene Art in deep darkened ambiance */}
        <img
          src={NOVEL_IMAGES.novel1}
          alt="The Botanical Conservatory Backdrop"
          className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07050D] via-[#0D0818]/90 to-[#07050D]/80" />

        {/* Ambient Chronal Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#824B85]/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#3B1D40]/30 blur-3xl pointer-events-none" />
      </div>

      {/* Retro CRT Scanline & Grain Subtle Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black" />

      {/* itch.io Style Launcher Card */}
      <div className="relative w-full max-w-xl bg-[#140F20]/95 border-2 border-[#824B85] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(130,75,133,0.3)] pixel-corners-box flex flex-col items-center p-5 sm:p-8 backdrop-blur-md z-10 text-center animate-fade-in">
        
        {/* Top Decorative Frame Header */}
        <div className="w-full flex items-center justify-between border-b-2 border-dashed border-[#824B85]/40 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#D8B4FE]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 2h2v2H3V2zm6 0h2v2H9V2zM1 4h2v2H1V4zm10 0h2v2h-2V4zM0 6h3v4H0V6zm11 0h3v4h-3V6zm-5 1h2v6H6V7zm-3 2h2v2H3V9zm6 0h2v2H9V9zm-4 4h4v2H5v-2z" />
            </svg>
            <span className="font-silkscreen text-[11px] sm:text-xs font-bold tracking-widest text-[#D8B4FE] uppercase">
              BEHIND_THE_DOODLES.EXE · LAUNCHER
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#824B85]/30 border border-[#824B85] font-pixel text-[10px] text-[#FBCFE8] uppercase tracking-wider">
            WEB EMBED v2.4
          </span>
        </div>

        {/* Game Title & Subtitle */}
        <h1 className="font-silkscreen font-bold text-2xl sm:text-3xl text-[#FAF5FF] tracking-wider mb-2 drop-shadow-[0_2px_10px_rgba(216,180,254,0.5)]">
          BEHIND THE DOODLES
        </h1>
        <p className="font-pixel text-xs sm:text-sm text-[#D8B4FE] tracking-wide mb-6 max-w-md leading-relaxed">
          Interactive Visual Novel
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-[10px] font-pixel font-bold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#201430] border border-[#824B85]/60 text-[#FBCFE8]">
            <svg className="w-3 h-3 text-[#A7F3D0]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
            </svg>
            <span>FULLSCREEN OVERLAY</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#201430] border border-[#824B85]/60 text-[#FBCFE8]">
            <svg className="w-3 h-3 text-[#BAE6FD]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
              <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 14 8a.5.5 0 0 1-1 0 5 5 0 0 0-5-5zm0 10c1.552 0 2.94-.707 3.857-1.818a.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2 8a.5.5 0 0 1 1 0 5 5 0 0 0 5 5z" />
            </svg>
            <span>16:9 WIDESCREEN</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#201430] border border-[#824B85]/60 text-[#FBCFE8]">
            <svg className="w-3 h-3 text-[#FDE68A]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
              <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
            </svg>
            <span>CINEMATIC AUDIO</span>
          </div>
        </div>

        {/* Primary Action: LAUNCH GAME BUTTON (High visibility itch.io style) */}
        <button
          onClick={onLaunch}
          className="group relative w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 font-silkscreen font-bold text-sm sm:text-base tracking-widest uppercase pixel-corners-box transition-all flex items-center justify-center gap-3 mb-5 bg-gradient-to-r from-[#824B85] via-[#A855F7] to-[#EC4899] hover:from-[#9333EA] hover:to-[#F43F5E] text-[#FAF5FF] shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_45px_rgba(236,72,153,0.8)] transform active:scale-98 cursor-pointer"
        >
          {/* Inner border pixel accent */}
          <div className="absolute inset-[3px] border border-white/40 pixel-corners-sm pointer-events-none" />

          {/* Stepped Play Icon SVG */}
          <svg
            className="w-5 h-5 text-white transition-transform transform group-hover:scale-110"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4 2.5v11l9-5.5-9-5.5z" />
          </svg>

          <span>LAUNCH GAME</span>
        </button>

        {/* Description & Instruction Notes */}
        <div className="border-t border-[#824B85]/30 pt-4 w-full">
          <p className="font-pixel text-[11px] sm:text-xs text-[#FAF5FF]/70 leading-relaxed mb-2">
            Clicking Launch triggers Fullscreen and initializes immersive audio in the responsive 16:9 widescreen frame.
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-[#D8B4FE]/60">
            <span>[SPACE / CLICK] Advance</span>
            <span>·</span>
            <span>[V] Visuals Log</span>
            <span>·</span>
            <span>[H] Dialogue Log</span>
          </div>
        </div>

      </div>
    </div>
  );
};
