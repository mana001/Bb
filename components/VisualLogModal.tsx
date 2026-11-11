import React, { useState } from 'react';
import { STORY_NODES, VISUAL_CHAPTERS, VisualChapter } from '../data/story.ts';

interface VisualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNodeIndex: number;
  onJumpToNode: (nodeIndex: number) => void;
}

export const VisualLogModal: React.FC<VisualLogModalProps> = ({
  isOpen,
  onClose,
  currentNodeIndex,
  onJumpToNode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'INTRO', 'ARTIST', 'EPILOGUE', 'INTERVIEW', 'BTS', 'BREAK'];

  const filteredChapters = VISUAL_CHAPTERS.filter((chap) => {
    const matchesSearch =
      chap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterCategory === 'ALL') return matchesSearch;
    if (filterCategory === 'ARTIST') return matchesSearch && (chap.category.startsWith('ARTIST') || chap.category.startsWith('HOST'));
    if (filterCategory === 'BTS') return matchesSearch && chap.category.includes('BEHIND THE SCENES');
    return matchesSearch && chap.category === filterCategory;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visual Scene Navigator"
    >
      <div
        className="relative w-full max-w-2xl bg-[#1A1624] border-2 border-[#824B85] shadow-2xl flex flex-col max-h-[85vh] pixel-corners-box overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Title Bar */}
        <header className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#D8B4FE] via-[#FBCFE8] to-[#DDD6FE] border-b-2 border-[#824B85] text-xs font-mono select-none shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#4C286A]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
            </svg>
            <span className="font-bold text-[#341F48] font-silkscreen uppercase tracking-wider text-xs sm:text-sm">
              VISUAL SELECTOR · SCENE LOG
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center bg-[#FAF5FF] hover:bg-[#F43F5E] hover:text-white text-[#341F48] font-bold text-xs pixel-corners-sm transition-colors cursor-pointer"
            title="Close Navigator"
            aria-label="Close Navigator"
          >
            <svg className="w-3 h-3" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </header>

        {/* Filter and Search Bar */}
        <div className="p-3 bg-[#241B32] border-b border-[#824B85]/40 flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visual or character..."
              className="w-full px-3 py-1.5 bg-[#140F1D] border border-[#824B85] text-xs font-pixel text-[#FAF5FF] placeholder-[#FAF5FF]/40 outline-none focus:border-[#FBCFE8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[#FAF5FF]/60 hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="9" y2="9" />
                  <line x1="9" y1="1" x2="1" y2="9" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-1 text-[10px] font-pixel font-bold uppercase transition-colors shrink-0 ${
                  filterCategory === cat
                    ? 'bg-[#824B85] text-[#FAF5FF] shadow-sm'
                    : 'bg-[#140F1D] text-[#D8B4FE]/70 hover:bg-[#341F48] hover:text-white border border-[#824B85]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Scene Grid / List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
          {filteredChapters.map((chap) => {
            // Determine if current node falls into this chapter
            const globalIdx = VISUAL_CHAPTERS.indexOf(chap);
            const nextChap = globalIdx >= 0 ? VISUAL_CHAPTERS[globalIdx + 1] : undefined;
            const isCurrent =
              currentNodeIndex >= chap.nodeIndex &&
              (!nextChap || currentNodeIndex < nextChap.nodeIndex);

            return (
              <div
                key={`${chap.id}-${chap.nodeIndex}`}
                onClick={() => {
                  const target = STORY_NODES.findIndex((n) => n.sceneId === chap.id);
                  onJumpToNode(target !== -1 ? target : chap.nodeIndex);
                  onClose();
                }}
                className={`flex items-center justify-between p-2 sm:p-2.5 border-2 transition-all cursor-pointer group ${
                  isCurrent
                    ? 'bg-[#4C1D54]/80 border-[#FBCFE8] shadow-[0_0_15px_rgba(251,207,232,0.3)]'
                    : 'bg-[#21162C]/80 hover:bg-[#3B1D40]/70 border-[#824B85]/50 hover:border-[#824B85]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category badge & indicator */}
                  <div className="flex flex-col items-center justify-center w-12 shrink-0 py-1 bg-[#140E1D] border border-[#824B85]/60 pixel-corners-sm">
                    <span className="text-[9px] font-silkscreen text-[#D8B4FE] font-bold">
                      {chap.isVideo ? 'VIDEO' : 'IMAGE'}
                    </span>
                    <span className="text-[8px] font-pixel text-[#FAF5FF]/70 uppercase">
                      {chap.category.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-silkscreen text-xs sm:text-sm font-bold text-[#FAF5FF] group-hover:text-[#FBCFE8] truncate">
                        {chap.name}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 bg-[#F43F5E] text-white text-[9px] font-silkscreen font-bold tracking-wider animate-pulse pixel-corners-sm">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-pixel text-[#D8B4FE]/80">
                      Jump to scene start · Step #{chap.nodeIndex + 1}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpToNode(chap.nodeIndex);
                      onClose();
                    }}
                    className={`px-3 py-1 text-xs font-silkscreen font-bold pixel-corners-sm transition-all ${
                      isCurrent
                        ? 'bg-[#FBCFE8] text-[#2E1230]'
                        : 'bg-[#824B85] hover:bg-[#9B5C9E] text-white'
                    }`}
                  >
                    {isCurrent ? 'ACTIVE' : 'JUMP ▶'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredChapters.length === 0 && (
            <div className="p-8 text-center text-xs font-pixel text-[#FAF5FF]/60">
              No scenes matched your search.
            </div>
          )}
        </div>

        {/* Modal Footer with Quick Hint */}
        <footer className="px-3 py-2 bg-[#140E1D] border-t border-[#824B85]/40 flex items-center justify-between text-[11px] font-pixel text-[#FAF5FF]/70 shrink-0">
          <span>Click any scene to jump immediately without clicking through steps.</span>
          <span className="hidden sm:inline-block text-[#D8B4FE]">Press ESC to close</span>
        </footer>
      </div>
    </div>
  );
};
