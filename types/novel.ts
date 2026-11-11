export interface StoryNode {
  id: number;
  sceneId: 'scene-1' | 'scene-2' | 'scene-3' | 'scene-4' | string;
  sceneTitle: string;
  sceneImage: string;
  posterImage?: string;
  isVideo?: boolean;
  textBoxDelaySeconds?: number;
  speaker: string;
  portraitImage: string;
  dialogue: string;
  soundCue?: 'advance' | 'scene_swap';
  hideTextBox?: boolean;
  isPhotoMode?: boolean;
  autoAdvanceOnEnded?: boolean;
  transition?: 'push-down' | 'slide-down';
  choices?: {
    text: string;
    targetNodeId: number;
  }[];
}

export type TextSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export interface NovelState {
  currentNodeIndex: number;
  isAutoPlay: boolean;
  isCrtEnabled: boolean;
  isMuted: boolean;
  textSpeed: TextSpeed;
  isHistoryOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  log: {
    speaker: string;
    text: string;
    sceneTitle: string;
    timestamp: string;
  }[];
}
