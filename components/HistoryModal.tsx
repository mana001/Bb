import React from 'react';

interface HistoryEntry {
  speaker: string;
  text: string;
  sceneTitle: string;
  timestamp: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  entries,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181322]/85 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] bg-[#231C30] border-2 border-[#D8B4FE] pixel-pastel-box flex flex-col overflow-hidden text-[#FAF5FF] shadow-[0_20px_40px_rgba(216,180,254,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#D8B4FE] to-[#FBCFE8] border-b-2 border-[#332247] font-mono text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#3D1E5A]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h8v2H2v-2z" />
            </svg>
            <span className="font-bold text-[#34184C] tracking-wider font-pixel">
              DIALOGUE BACKLOG & TRANSCRIPT
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 pixel-pastel-button bg-[#FAF5FF] hover:bg-[#FCE7F3] text-[#34184C] flex items-center justify-center text-xs font-bold rounded-xs cursor-pointer"
            aria-label="Close dialogue backlog"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>

        {/* Scrollable backlog list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {entries.length === 0 ? (
            <p className="text-center text-[#BDB2D2] text-xs py-8 font-mono">
              [NO TRANSCRIPT RECORDED YET]
            </p>
          ) : (
            entries.map((entry, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#1A1426] border border-[#43345A] pixel-pastel-inset"
              >
                <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                  <span className="font-bold text-[#FBCFE8] uppercase tracking-wider">
                    {entry.speaker}
                  </span>
                  <span className="text-[#A7F3D0] text-[10px]">
                    {entry.sceneTitle} · {entry.timestamp}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#FAF5FF] leading-relaxed font-sans">
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#1E172B] border-t border-[#3B2D4F] flex justify-between items-center text-xs font-mono text-[#DDD6FE]">
          <span>{entries.length} Events recorded</span>
          <button
            onClick={onClose}
            className="px-3 py-1 pixel-pastel-button bg-[#D8B4FE] text-[#2C163E] hover:bg-[#C084FC] font-bold rounded-xs"
          >
            RETURN TO NOVEL
          </button>
        </div>
      </div>
    </div>
  );
};
