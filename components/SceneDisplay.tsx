import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StoryNode, TextSpeed } from '../types/novel.ts';
import { DialogueBox } from './DialogueBox.tsx';
import { NOVEL_IMAGES, STORY_NODES } from '../data/story.ts';
import { retroAudio } from '../utils/sound.ts';

// In-memory cache for preloaded and decoded images to eliminate transition latency
const decodedImageCache = new Set<string>();

function preloadAndDecodeImage(src: string): Promise<void> {
  if (!src || decodedImageCache.has(src)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    decodedImageCache.add(src);
    if (typeof (img as any).decode === 'function') {
      img
        .decode()
        .then(() => resolve())
        .catch(() => resolve());
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}

interface SceneDisplayProps {
  currentNode: StoryNode;
  currentNodeIndex?: number;
  textSpeed: TextSpeed;
  isAutoPlay: boolean;
  onAdvance: () => void;
  onSelectChoice?: (targetNodeId: number) => void;
  isGlitching: boolean;
  isMuted: boolean;
  onMediaAspectChange?: (aspect: number, width: number, height: number) => void;
}

export const SceneDisplay: React.FC<SceneDisplayProps> = ({
  currentNode,
  currentNodeIndex,
  textSpeed,
  isAutoPlay,
  onAdvance,
  onSelectChoice,
  isGlitching,
  isMuted,
  onMediaAspectChange,
}) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [hasCapturedPhoto, setHasCapturedPhoto] = useState(false);
  const [delayedReadyNodeId, setDelayedReadyNodeId] = useState<number | null>(
    !currentNode.textBoxDelaySeconds ? currentNode.id : null
  );
  const [isTextManuallyHidden, setIsTextManuallyHidden] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previousSceneIdRef = useRef<string | null>(null);
  const hasAutoAdvancedRef = useRef(false);

  // Under-layer persistence to guarantee zero black frames during video-to-image switch
  const [prevMedia, setPrevMedia] = useState<{ isVideo: boolean; src: string } | null>(null);
  const [isCurrentLoaded, setIsCurrentLoaded] = useState<boolean>(!currentNode.isVideo);
  const lastMediaRef = useRef<{ isVideo: boolean; src: string }>({
    isVideo: !!currentNode.isVideo,
    src: currentNode.sceneImage,
  });

  useEffect(() => {
    const isNewMedia =
      lastMediaRef.current.src !== currentNode.sceneImage ||
      lastMediaRef.current.isVideo !== !!currentNode.isVideo;

    if (isNewMedia) {
      setPrevMedia({
        isVideo: lastMediaRef.current.isVideo,
        src: lastMediaRef.current.src,
      });
      setIsCurrentLoaded(false);
      lastMediaRef.current = {
        isVideo: !!currentNode.isVideo,
        src: currentNode.sceneImage,
      };
    }
  }, [currentNode.id, currentNode.sceneImage, currentNode.isVideo]);

  const handleCurrentMediaReady = useCallback(() => {
    setIsCurrentLoaded(true);
    requestAnimationFrame(() => {
      setPrevMedia(null);
    });
  }, []);

  // Instantly report or probe media aspect ratio for dynamic window sizing
  useEffect(() => {
    if (currentNode.isVideo) {
      onMediaAspectChange?.(16 / 9, 736, 414);
    } else if (currentNode.sceneImage) {
      const probe = new Image();
      probe.src = currentNode.sceneImage;
      if (probe.complete && probe.naturalWidth && probe.naturalHeight) {
        onMediaAspectChange?.(probe.naturalWidth / probe.naturalHeight, probe.naturalWidth, probe.naturalHeight);
      } else {
        probe.onload = () => {
          if (probe.naturalWidth && probe.naturalHeight) {
            onMediaAspectChange?.(probe.naturalWidth / probe.naturalHeight, probe.naturalWidth, probe.naturalHeight);
          }
        };
      }
    }
  }, [currentNode.id, currentNode.sceneImage, currentNode.isVideo, onMediaAspectChange]);

  const activeIndex =
    typeof currentNodeIndex === 'number'
      ? currentNodeIndex
      : STORY_NODES.findIndex((n) => n.id === currentNode.id);

  // Background Asset Preloader: Identify and queue upcoming PNG images in memory
  const upcomingImages = useMemo(() => {
    if (activeIndex === -1) return [];
    const list: string[] = [];

    // If current node is a video, prioritize the immediate upcoming PNG image that follows this video
    if (currentNode.isVideo) {
      for (let i = activeIndex + 1; i < STORY_NODES.length; i++) {
        const nextNode = STORY_NODES[i];
        if (!nextNode.isVideo && nextNode.sceneImage) {
          list.push(nextNode.sceneImage);
          break;
        }
      }
    }

    // Also look ahead 8 nodes for images & character portraits
    for (
      let i = activeIndex + 1;
      i < Math.min(STORY_NODES.length, activeIndex + 8);
      i++
    ) {
      const node = STORY_NODES[i];
      if (!node.isVideo && node.sceneImage && !list.includes(node.sceneImage)) {
        list.push(node.sceneImage);
      }
      if (node.portraitImage && !list.includes(node.portraitImage)) {
        list.push(node.portraitImage);
      }
    }
    return list;
  }, [activeIndex, currentNode.isVideo]);

  // Silently load and decode upcoming PNGs while current video or scene is playing
  useEffect(() => {
    upcomingImages.forEach((imgSrc) => {
      preloadAndDecodeImage(imgSrc);
    });
  }, [upcomingImages]);

  // Reset states on scene/node navigation
  useEffect(() => {
    setIsTextManuallyHidden(false);
    hasAutoAdvancedRef.current = false;
  }, [currentNode.id]);

  // Sync mute state
  useEffect(() => {
    retroAudio.setMuted(isMuted);
  }, [isMuted]);

  // Handle delay before displaying text box (guaranteed no flash)
  useEffect(() => {
    if (currentNode.textBoxDelaySeconds && currentNode.textBoxDelaySeconds > 0) {
      setDelayedReadyNodeId(null);
      const timer = window.setTimeout(() => {
        setDelayedReadyNodeId(currentNode.id);
      }, currentNode.textBoxDelaySeconds * 1000);
      return () => clearTimeout(timer);
    } else {
      setDelayedReadyNodeId(currentNode.id);
    }
  }, [currentNode.id, currentNode.textBoxDelaySeconds]);

  const isDelayedTextReady =
    !currentNode.textBoxDelaySeconds || delayedReadyNodeId === currentNode.id;

  // Upbeat Jazz music (mixkit-upbeat-jazz-644.mp3): plays from Intro 0 until #STEP7 (scene-intro2)
  useEffect(() => {
    const isOpeningScene =
      currentNode.sceneId === 'scene-in' ||
      currentNode.sceneId === 'scene-intro0' ||
      currentNode.sceneId === 'scene-disclaimer' ||
      currentNode.sceneId === 'scene-1' ||
      currentNode.sceneId === 'scene-2-photo' ||
      currentNode.sceneId === 'scene-intro' ||
      currentNode.sceneId === 'scene-intro1' ||
      currentNode.sceneId === 'scene-intro2';

    if (isOpeningScene) {
      retroAudio.stopCafeMusic();
      retroAudio.stopStarostinMusic();
    }

    // The MP3 mixkit-upbeat-jazz-644 plays at the same time with the video sounds from intro0.mp4 through #STEP7 (scene-intro2). Don't mute any.
    const isJazzScene =
      currentNode.sceneId === 'scene-intro0' ||
      currentNode.sceneId === 'scene-disclaimer' ||
      currentNode.sceneId === 'scene-1' ||
      currentNode.sceneId === 'scene-2-photo' ||
      currentNode.sceneId === 'scene-intro' ||
      currentNode.sceneId === 'scene-intro1' ||
      currentNode.sceneId === 'scene-intro2';

    if (isJazzScene) {
      retroAudio.startJazzMusic(0.35);
    } else {
      retroAudio.stopJazzMusic();
    }
  }, [currentNode.sceneId]);

  // Sneaky Adventure music: plays during Visual 6 and Visual 7 (+40% volume: 0.35)
  useEffect(() => {
    const isVisual6Or7 =
      currentNode.sceneId === 'scene-6' ||
      currentNode.sceneId === 'scene-7' ||
      currentNode.sceneTitle === 'VISUAL 6' ||
      currentNode.sceneTitle === 'VISUAL 7';

    if (isVisual6Or7) {
      retroAudio.startSneakyAdventureMusic(0.91);
    } else {
      retroAudio.stopSneakyAdventureMusic();
    }
  }, [currentNode.id, currentNode.sceneId, currentNode.sceneTitle]);

  // Sneaky Snitch music: Starts at 00:01 of Visual 9, continues through Visual 99, stops at Break 1 (+30% volume: 0.91)
  useEffect(() => {
    const isVisual9Or99 =
      currentNode.sceneId === 'scene-9' ||
      currentNode.sceneId === 'scene-9-1' ||
      currentNode.sceneId === 'scene-99' ||
      currentNode.sceneTitle === 'VISUAL 9' ||
      currentNode.sceneTitle === 'VISUAL 9.1' ||
      currentNode.sceneTitle === 'VISUAL 99';

    if (!isVisual9Or99) {
      retroAudio.stopSneakySnitchMusic();
      return;
    }

    let timer: number | null = null;
    if (currentNode.sceneId === 'scene-9' && currentNode.textBoxDelaySeconds) {
      timer = window.setTimeout(() => {
        retroAudio.stopStarostinMusic();
        retroAudio.startSneakySnitchMusic(0.91);
      }, (currentNode.textBoxDelaySeconds || 1.0) * 1000);
    } else {
      retroAudio.stopStarostinMusic();
      retroAudio.startSneakySnitchMusic(0.91);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [currentNode.id, currentNode.sceneId, currentNode.sceneTitle, currentNode.textBoxDelaySeconds]);

  // Cricket MP3 management for Visual 13 (+40% volume: 0.70, stops Starostin)
  useEffect(() => {
    const isVisual13 =
      currentNode.sceneId === 'scene-13' || currentNode.sceneTitle === 'VISUAL 13';

    if (isVisual13) {
      retroAudio.stopStarostinMusic();
      retroAudio.playCricketMusic(0.70);
    } else {
      retroAudio.stopCricketMusic();
    }
  }, [currentNode.id, currentNode.sceneId, currentNode.sceneTitle]);

  // Starostin BGM management across scenes:
  // - Starts at intro.mp4, plays at 30% through intro1 and intro2
  // - Lowers to 4% volume after intro2 (visual 3 through 55)
  // - MUST STOP at glitch.mp4 (scene-glitch)
  // - MUST STOP at Visual 6 and Visual 7 [Sneaky Adventure plays]
  // - RE-CONTINUES at Visual 8 at 4%
  // - MUST STOP at Visual 9 and Visual 99 [Sneaky Snitch plays]
  // - MUST STOP at break1 (INTERMISSION)
  // - RE-CONTINUES after break1 (visual 10, 11, 12) at 4%
  // - MUST STOP at Visual 13 (cricket mp3 plays) and Visual 14 (deadpan silence)
  // - RE-CONTINUES at Visual 15 and Visual 16 (Whitee interview) at 4%
  // - MUST STOP at break2 and break22 (Intermission 2 & Finale)
  // - Stops completely if returning to Visual 1 or 2 (cafe music)
  useEffect(() => {
    const isGlitchScene =
      currentNode.sceneId.includes('glitch') || currentNode.sceneTitle === 'ANOMALY DETECTED';

    const isVisual6Or7 =
      currentNode.sceneId === 'scene-6' ||
      currentNode.sceneId === 'scene-7' ||
      currentNode.sceneTitle === 'VISUAL 6' ||
      currentNode.sceneTitle === 'VISUAL 7';

    const isVisual9Or99 =
      currentNode.sceneId === 'scene-9' ||
      currentNode.sceneId === 'scene-9-1' ||
      currentNode.sceneId === 'scene-99' ||
      currentNode.sceneTitle === 'VISUAL 9' ||
      currentNode.sceneTitle === 'VISUAL 9.1' ||
      currentNode.sceneTitle === 'VISUAL 99';

    const isBreak =
      currentNode.sceneId.startsWith('scene-break') ||
      currentNode.sceneId === 'scene-15-2' ||
      currentNode.sceneTitle.includes('INTERMISSION') ||
      currentNode.sceneTitle.includes('FINALE');

    const isVisual13Or14 =
      currentNode.sceneId === 'scene-13' ||
      currentNode.sceneId === 'scene-14' ||
      currentNode.sceneTitle === 'VISUAL 13' ||
      currentNode.sceneTitle === 'VISUAL 14';

    const isCafeScene =
      currentNode.sceneId === 'scene-1' ||
      currentNode.sceneId === 'scene-2-photo';

    const isIntroScene =
      currentNode.sceneId === 'scene-intro' ||
      currentNode.sceneId === 'scene-intro1' ||
      currentNode.sceneId === 'scene-intro2';

    const isCameraScene =
      currentNode.sceneId.includes('camera') || currentNode.sceneImage.includes('camera.mp4');

    const isBehindTheScenes =
      !isIntroScene &&
      (currentNode.sceneTitle.includes('BEHIND THE SCENES') ||
        currentNode.sceneTitle.includes('POST-CREDITS') ||
        currentNode.sceneId.startsWith('scene-44') ||
        currentNode.sceneId.startsWith('scene-45') ||
        currentNode.sceneId.startsWith('scene-46') ||
        currentNode.sceneId.startsWith('scene-47') ||
        currentNode.sceneId.startsWith('scene-48') ||
        currentNode.sceneId.startsWith('scene-49') ||
        currentNode.sceneId.startsWith('scene-50') ||
        currentNode.sceneId.startsWith('scene-51') ||
        currentNode.sceneId.startsWith('scene-52') ||
        currentNode.sceneId.startsWith('scene-53') ||
        currentNode.sceneId.startsWith('scene-54') ||
        currentNode.sceneId.startsWith('scene-55') ||
        currentNode.sceneId.startsWith('scene-56') ||
        currentNode.sceneId.startsWith('scene-57') ||
        currentNode.sceneId === 'scene-58' ||
        currentNode.sceneId.startsWith('scene-59') ||
        currentNode.sceneId.startsWith('scene-60') ||
        currentNode.sceneId.startsWith('scene-61') ||
        currentNode.sceneId.startsWith('scene-62') ||
        currentNode.sceneId.startsWith('scene-63') ||
        currentNode.sceneId.startsWith('scene-64') ||
        currentNode.sceneId === 'scene-65' ||
        currentNode.sceneId === 'scene-glitch-after-65' ||
        currentNode.sceneId === 'scene-55-finale' ||
        currentNode.sceneId.startsWith('scene-70') ||
        currentNode.sceneId.startsWith('scene-71') ||
        currentNode.sceneId.startsWith('scene-72') ||
        currentNode.sceneId.startsWith('scene-80') ||
        currentNode.sceneId.startsWith('scene-81') ||
        currentNode.sceneId.startsWith('scene-82') ||
        currentNode.sceneId.startsWith('scene-83') ||
        currentNode.sceneId.startsWith('scene-84') ||
        currentNode.sceneId.startsWith('scene-85') ||
        currentNode.sceneId === 'scene-90' ||
        currentNode.sceneId === 'scene-91' ||
        currentNode.sceneId === 'scene-92' ||
        currentNode.sceneId === 'scene-93' ||
        currentNode.sceneId === 'scene-94' ||
        currentNode.sceneId === 'scene-glitch-after-94' ||
        currentNode.sceneId === 'scene-credits' ||
        currentNode.sceneId.startsWith('scene-end') ||
        currentNode.sceneId === 'scene-disclaimer');

    const isOpeningScene =
      currentNode.sceneId === 'scene-in' ||
      currentNode.sceneId === 'scene-intro0' ||
      currentNode.sceneId === 'scene-disclaimer' ||
      currentNode.sceneId === 'scene-1' ||
      currentNode.sceneId === 'scene-2-photo' ||
      currentNode.sceneId === 'scene-intro' ||
      currentNode.sceneId === 'scene-intro1' ||
      currentNode.sceneId === 'scene-intro2';

    if (
      isOpeningScene ||
      isCafeScene ||
      currentNode.sceneId === 'scene-86'
    ) {
      retroAudio.stopStarostinMusic();
    } else if (isGlitchScene || isCameraScene || isVisual6Or7 || isVisual9Or99 || isBreak || isVisual13Or14 || isBehindTheScenes) {
      retroAudio.stopStarostinMusic();
    } else {
      // Plays at 4% volume (visual 2..55, visual 8, visual 10..12, visual 15..27)
      retroAudio.playStarostinMusic(0.04);
    }
  }, [currentNode.id, currentNode.sceneId, currentNode.sceneTitle]);

  // Comedy Cartoon funny background music: Plays from Visual 44 through Visual 58, 59, 60-65
  useEffect(() => {
    const isIntroScene =
      currentNode.sceneId === 'scene-in' ||
      currentNode.sceneId === 'scene-intro' ||
      currentNode.sceneId === 'scene-intro1' ||
      currentNode.sceneId === 'scene-intro2';

    const isGr0zaScene =
      currentNode.sceneId.startsWith('scene-80') ||
      currentNode.sceneId.startsWith('scene-81') ||
      currentNode.sceneId.startsWith('scene-82') ||
      currentNode.sceneId.startsWith('scene-83') ||
      currentNode.sceneId.startsWith('scene-84') ||
      currentNode.sceneId.startsWith('scene-85');

    const isComedyScene =
      !isIntroScene &&
      !isGr0zaScene &&
      !currentNode.sceneId.startsWith('scene-glitch-finale') &&
      !currentNode.sceneId.startsWith('scene-end') &&
      currentNode.sceneId !== 'scene-credits' &&
      currentNode.sceneId !== 'scene-in' &&
      currentNode.sceneId !== 'scene-disclaimer' &&
      currentNode.sceneId !== 'scene-intro0' &&
      currentNode.sceneId !== 'scene-86' &&
      (currentNode.sceneTitle.includes('BEHIND THE SCENES') ||
        currentNode.sceneTitle.includes('POST-CREDITS') ||
        currentNode.sceneId.startsWith('scene-44') ||
        currentNode.sceneId.startsWith('scene-45') ||
        currentNode.sceneId.startsWith('scene-46') ||
        currentNode.sceneId.startsWith('scene-47') ||
        currentNode.sceneId.startsWith('scene-48') ||
        currentNode.sceneId.startsWith('scene-49') ||
        currentNode.sceneId.startsWith('scene-50') ||
        currentNode.sceneId.startsWith('scene-51') ||
        currentNode.sceneId.startsWith('scene-52') ||
        currentNode.sceneId.startsWith('scene-53') ||
        currentNode.sceneId.startsWith('scene-54') ||
        currentNode.sceneId.startsWith('scene-55') ||
        currentNode.sceneId.startsWith('scene-56') ||
        currentNode.sceneId.startsWith('scene-57') ||
        currentNode.sceneId === 'scene-58' ||
        currentNode.sceneId.startsWith('scene-59') ||
        currentNode.sceneId.startsWith('scene-60') ||
        currentNode.sceneId.startsWith('scene-61') ||
        currentNode.sceneId.startsWith('scene-62') ||
        currentNode.sceneId.startsWith('scene-63') ||
        currentNode.sceneId.startsWith('scene-64') ||
        currentNode.sceneId === 'scene-65' ||
        currentNode.sceneId === 'scene-glitch-after-65' ||
        currentNode.sceneId === 'scene-90' ||
        currentNode.sceneId === 'scene-91' ||
        currentNode.sceneId === 'scene-92' ||
        currentNode.sceneId === 'scene-93' ||
        currentNode.sceneId === 'scene-94' ||
        currentNode.sceneId === 'scene-glitch-after-94' ||
        currentNode.sceneId === 'scene-55-finale');

    if (isComedyScene) {
      retroAudio.stopStarostinMusic();
      retroAudio.stopGr0zaMusic();
      retroAudio.startComedyMusic(0.4);
    } else {
      retroAudio.stopComedyMusic();
    }
  }, [currentNode.id, currentNode.sceneId, currentNode.sceneTitle]);

  // gr0za-tv-show-intro-music (Plays from Visual 80 through Visual 85)
  useEffect(() => {
    const isGr0zaScene =
      currentNode.sceneId.startsWith('scene-80') ||
      currentNode.sceneId.startsWith('scene-81') ||
      currentNode.sceneId.startsWith('scene-82') ||
      currentNode.sceneId.startsWith('scene-83') ||
      currentNode.sceneId.startsWith('scene-84') ||
      currentNode.sceneId.startsWith('scene-85');

    if (isGr0zaScene) {
      retroAudio.stopStarostinMusic();
      retroAudio.stopComedyMusic();
      retroAudio.startGr0zaMusic(0.45);
    } else {
      retroAudio.stopGr0zaMusic();
    }
  }, [currentNode.id, currentNode.sceneId, currentNode.sceneTitle]);

  // Cleanup all audio on unmount
  useEffect(() => {
    return () => {
      retroAudio.stopJazzMusic();
      retroAudio.stopCafeMusic();
      retroAudio.stopStarostinMusic();
      retroAudio.stopSneakyAdventureMusic();
      retroAudio.stopSneakySnitchMusic();
      retroAudio.stopCricketMusic();
      retroAudio.stopComedyMusic();
      retroAudio.stopGr0zaMusic();
    };
  }, []);

  // Reset photo capture state if navigating away from photo mode
  useEffect(() => {
    if (!currentNode.isPhotoMode) {
      setHasCapturedPhoto(false);
      setIsFlashing(false);
    }
  }, [currentNode.isPhotoMode]);

  // Video playback handling: plays once cleanly when entering a video scene
  useEffect(() => {
    const isNewScene = previousSceneIdRef.current !== currentNode.sceneId;
    previousSceneIdRef.current = currentNode.sceneId;

    if (isNewScene && currentNode.isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current.volume = 1.0;
      videoRef.current.play().catch(() => {});
    }

    // Explicit safeguard: If entering quiet scenes, glitches or breaks, force Starostin to stop immediately
    const isMutedMusicScene =
      currentNode.sceneId.includes('glitch') ||
      currentNode.sceneId.includes('camera') ||
      currentNode.sceneId.startsWith('scene-break') ||
      currentNode.sceneId === 'scene-15-2' ||
      currentNode.sceneTitle === 'ANOMALY DETECTED' ||
      currentNode.sceneTitle.includes('INTERMISSION') ||
      currentNode.sceneTitle.includes('FINALE') ||
      currentNode.sceneId === 'scene-6' ||
      currentNode.sceneId === 'scene-7' ||
      currentNode.sceneTitle === 'VISUAL 6' ||
      currentNode.sceneTitle === 'VISUAL 7' ||
      currentNode.sceneId === 'scene-9' ||
      currentNode.sceneId === 'scene-9-1' ||
      currentNode.sceneId === 'scene-99' ||
      currentNode.sceneId === 'scene-13' ||
      currentNode.sceneId === 'scene-14' ||
      currentNode.sceneTitle === 'VISUAL 9.1' ||
      currentNode.sceneTitle === 'VISUAL 13' ||
      currentNode.sceneTitle === 'VISUAL 14';

    if (isMutedMusicScene) {
      retroAudio.stopStarostinMusic();
    }
  }, [currentNode.id, currentNode.sceneId, currentNode.isVideo, currentNode.sceneTitle, isMuted]);

  // Sync mute state dynamically to current video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = 1.0;
    }
  }, [isMuted]);

  // Monitor video playback time to trigger delayed text box and timed audio triggers
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const time = e.currentTarget.currentTime;
    if (currentNode.textBoxDelaySeconds && time >= currentNode.textBoxDelaySeconds) {
      setDelayedReadyNodeId(currentNode.id);
    }

    // Precise video-time sync: Start playing Sneaky Snitch at 00:01 of Visual 9 (currentTime >= 1.0)
    if (
      (currentNode.sceneId === 'scene-9' || currentNode.sceneTitle === 'VISUAL 9') &&
      time >= 1.0
    ) {
      retroAudio.stopStarostinMusic();
      retroAudio.startSneakySnitchMusic(0.91);
    }
  };

  // Take Picture of the Group (viewfinder photo capture)
  const handleTakePhoto = useCallback(() => {
    retroAudio.playCameraShutter();
    retroAudio.duckCafeMusicForPhoto();
    retroAudio.duckJazzMusicForPhoto();
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      setHasCapturedPhoto(true);
    }, 350);
  }, []);

  // Download the captured group photo
  const handleDownloadPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = NOVEL_IMAGES.novel2;
    link.download = 'behind_the_doodles_group_photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // General click handler on the viewport
  const handleViewportClick = () => {
    if (isGlitching) return;

    // Intro 0 is strictly unskippable - user cannot skip it by clicking
    if (currentNode.sceneId === 'scene-intro0') {
      return;
    }

    if (isTextManuallyHidden) {
      setIsTextManuallyHidden(false);
      return;
    }

    if (currentNode.isPhotoMode) {
      if (!hasCapturedPhoto) {
        handleTakePhoto();
      } else {
        onAdvance();
      }
      return;
    }

    if (currentNode.autoAdvanceOnEnded) {
      if (hasAutoAdvancedRef.current) return;
      hasAutoAdvancedRef.current = true;
    }

    onAdvance();
  };

  return (
    <div
      onClick={handleViewportClick}
      className={`relative w-full h-full flex-1 max-w-full max-h-full overflow-hidden select-none ${
        isGlitching ? 'cursor-wait' : currentNode.sceneId === 'scene-intro0' ? 'cursor-default' : 'cursor-pointer'
      } flex flex-col justify-end bg-black shadow-inner`}
      role="button"
      tabIndex={0}
      aria-label={
        currentNode.isPhotoMode
          ? hasCapturedPhoto
            ? 'Group Photo Captured - Click to continue'
            : 'Camera Viewfinder - Click to take picture'
          : 'Scene Viewport - Click to advance'
      }
    >
      {/* 1. BACKGROUND UNDER-LAYER FOR ZERO-FLASH MEDIA SWAPS */}
      {/* Keeps previous video or image visible behind new image while it loads & decodes */}
      {prevMedia && !isCurrentLoaded && (
        prevMedia.isVideo ? (
          <video
            src={prevMedia.src}
            playsInline
            muted
            className="novel-scene-media absolute inset-0 w-full h-full select-none bg-black pointer-events-none z-0"
            style={{
              objectFit: 'fill',
              objectPosition: 'center',
            }}
          />
        ) : (
          <img
            src={prevMedia.src}
            alt=""
            className="novel-scene-media absolute inset-0 w-full h-full select-none bg-black pointer-events-none z-0"
            style={{
              objectFit: 'fill',
              objectPosition: 'center',
            }}
          />
        )
      )}

      {/* 2. ACTIVE FOREGROUND MEDIA (IMAGE OR VIDEO) */}
      {/* Stretches and scales to completely fill the window frame with zero black bars and zero cropping */}
      {currentNode.isVideo ? (
        <video
          key={currentNode.sceneImage}
          ref={videoRef}
          src={currentNode.sceneImage}
          preload="auto"
          playsInline
          muted={isMuted}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.muted = isMuted;
            v.volume = 1.0;
            if (v.videoWidth && v.videoHeight) {
              onMediaAspectChange?.(v.videoWidth / v.videoHeight, v.videoWidth, v.videoHeight);
            }
          }}
          onCanPlay={(e) => {
            handleCurrentMediaReady();
            const v = e.currentTarget;
            v.muted = isMuted;
            v.volume = 1.0;
            if (v.currentTime === 0) {
              v.play().catch(() => {});
            }
          }}
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={(e) => {
            e.currentTarget.pause();
            if (currentNode.sceneId === 'scene-8') {
              e.currentTarget.currentTime = Math.max(0, e.currentTarget.duration - 0.2);
              e.currentTarget.pause();
            }
            if (currentNode.autoAdvanceOnEnded && !hasAutoAdvancedRef.current) {
              hasAutoAdvancedRef.current = true;
              onAdvance();
            }
          }}
          className="novel-scene-media absolute inset-0 w-full h-full select-none bg-black pointer-events-none z-10"
          style={{
            objectFit: 'fill',
            objectPosition: 'center',
          }}
        />
      ) : (
        <img
          key={currentNode.sceneImage}
          src={isGlitching ? NOVEL_IMAGES.novel1 : currentNode.sceneImage}
          alt={currentNode.sceneTitle}
          loading="eager"
          decoding="sync"
          onLoad={(e) => {
            handleCurrentMediaReady();
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              onMediaAspectChange?.(img.naturalWidth / img.naturalHeight, img.naturalWidth, img.naturalHeight);
            }
          }}
          className="novel-scene-media absolute inset-0 w-full h-full select-none bg-black pointer-events-none z-10"
          style={{
            objectFit: 'fill',
            objectPosition: 'center',
          }}
        />
      )}

      {/* 3. BACKGROUND ASSET PRELOADER (SILENT MEMORY & DOM PRELOAD FOR UPCOMING PNGs) */}
      <div
        className="asset-preloader-hidden"
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          visibility: 'hidden',
          zIndex: -999,
        }}
      >
        {upcomingImages.map((src, i) => (
          <img
            key={`preload-${src}-${i}`}
            src={src}
            loading="eager"
            decoding="sync"
            alt=""
            style={{ width: 1, height: 1, opacity: 0 }}
          />
        ))}
      </div>

      {/* 4. GLITCH EFFECT AT THE END OF VISUAL 5 */}
      {isGlitching && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <video
            src={NOVEL_IMAGES.novel5}
            playsInline
            muted
            className="novel-scene-media absolute inset-0 w-full h-full object-fill object-center glitch-layer-1 opacity-95 mix-blend-screen"
            style={{
              objectFit: 'fill',
              objectPosition: 'center',
            }}
          />

          <div className="absolute inset-0 bg-[#3B1D40]/70 mix-blend-color-dodge glitch-layer-2 opacity-90" />

          <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-85">
            <div className="h-4 w-full bg-[#FBCFE8]/70 transform translate-x-6 shadow-[0_0_12px_#FBCFE8]" />
            <div className="h-8 w-full bg-[#A7F3D0]/70 transform -translate-x-8 shadow-[0_0_12px_#A7F3D0]" />
            <div className="h-3 w-full bg-[#BAE6FD]/80 transform translate-x-10 shadow-[0_0_12px_#BAE6FD]" />
            <div className="h-6 w-full bg-[#D8B4FE]/80 transform -translate-x-5 shadow-[0_0_12px_#D8B4FE]" />
            <div className="h-5 w-full bg-[#FDE68A]/75 transform translate-x-4 shadow-[0_0_12px_#FDE68A]" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 py-1.5 bg-[#2B1B3C]/95 border-2 border-[#824B85] text-[#FAF5FF] font-silkscreen text-xs font-bold tracking-widest uppercase animate-pulse shadow-[0_0_20px_#824B85]">
              [CHRONAL GLITCH IN PROGRESS · TIMELINE CORRUPTION]
            </div>
          </div>

          <div className="absolute inset-0 bg-[#FAF5FF] glitch-flash-overlay pointer-events-none" />
        </div>
      )}

      {/* 4. AMBIENT PARTICLES OVER THE IMAGE (when not in photo mode and not video) */}
      {!isGlitching && !currentNode.isPhotoMode && !currentNode.isVideo && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-[#FBCFE8]/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-[#A7F3D0]/40 blur-[1px] animate-ping" />
          <div className="absolute top-1/2 left-2/3 w-2 h-2 rounded-full bg-[#D8B4FE]/50 blur-[2px] animate-pulse" />
          <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#BAE6FD]/40 blur-[1px] animate-ping" />
        </div>
      )}

      {/* 5. PHOTO MODE: CONTINUES IN THE SAME WINDOW */}
      {currentNode.isPhotoMode && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="bg-[#2B1B3C]/90 border-2 border-[#824B85] px-3 py-1.5 pixel-corners-sm shadow-md">
              <span className="font-silkscreen text-xs font-bold tracking-wider text-[#FAF5FF] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] animate-ping" />
                {hasCapturedPhoto ? 'PHOTO PREVIEW · STORED' : 'REC [00:00:02]'}
              </span>
            </div>

            <div className="bg-[#2B1B3C]/90 border-2 border-[#824B85] px-3 py-1.5 pixel-corners-sm shadow-md">
              <span className="font-pixel text-xs text-[#FAF5FF]">
                {hasCapturedPhoto ? 'STATUS: SAVED' : 'ISO 400 · AF-LOCK'}
              </span>
            </div>
          </div>

          {/* Stepped pixel camera viewfinder brackets */}
          <div className="relative flex-1 my-3 sm:my-4 flex items-center justify-center">
            <div className="w-4/5 h-4/5 relative border-2 border-dashed border-[#FBCFE8]/60 pixel-corners-box">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#824B85]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#824B85]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#824B85]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#824B85]" />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-5 h-5 border border-[#824B85]/60 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#824B85]/80" />
                </div>
              </div>

              {!hasCapturedPhoto && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center">
                  <span className="font-silkscreen text-[11px] sm:text-xs text-[#FAF5FF] bg-[#2B1B3C]/80 px-3 py-1 pixel-corners-sm border border-[#824B85] animate-pulse">
                    CLICK SCREEN OR PRESS SPACE TO CAPTURE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls After Photo Capture */}
          {hasCapturedPhoto && (
            <div className="flex flex-col items-center justify-center gap-2 pb-2 pointer-events-auto z-30">
              <div className="flex items-center gap-2 sm:gap-3 bg-[#26132C]/90 border-2 border-[#824B85] p-1.5 sm:p-2 pixel-corners-box shadow-[0_8px_25px_rgba(0,0,0,0.8)] backdrop-blur-xs">
                <button
                  onClick={handleDownloadPhoto}
                  className="px-3 py-1.5 bg-[#4F2054] hover:bg-[#3E1843] text-[#FAF5FF] font-silkscreen font-bold text-xs flex items-center gap-1.5 pixel-corners-sm transition-colors cursor-pointer"
                  title="Download group photo"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 12l-5-5h3V1h4v6h3l-5 5zM1 14h14v2H1v-2z" />
                  </svg>
                  <span>DOWNLOAD PIC</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdvance();
                  }}
                  className="px-5 py-1.5 bg-gradient-to-r from-[#D8B4FE] to-[#FBCFE8] hover:from-[#C084FC] hover:to-[#F472B6] text-[#2E1230] font-silkscreen font-bold text-xs flex items-center gap-2 pixel-corners-sm shadow-md transition-all transform active:scale-95 cursor-pointer"
                >
                  <span>NEXT</span>
                  <svg className="w-3.5 h-3.5 text-[#2E1230]" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 2v12l8-6-8-6z" />
                  </svg>
                </button>
              </div>

              <span className="text-[11px] font-pixel text-[#FAF5FF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/60 px-2.5 py-0.5 pixel-corners-sm">
                Click NEXT, press SPACE, or click anywhere to continue
              </span>
            </div>
          )}
        </div>
      )}

      {/* Camera Shutter Flash Effect */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white camera-flash-overlay pointer-events-none z-50" />
      )}

      {/* 6. TEXT BOX (Hidden if no text, explicitly hidden, or manually hidden by user to view artwork) */}
      {!isTextManuallyHidden &&
        !currentNode.hideTextBox &&
        isDelayedTextReady &&
        (isGlitching ||
          (currentNode.dialogue && currentNode.dialogue.trim().length > 0) ||
          (currentNode.choices && currentNode.choices.length > 0)) && (
        <div className="absolute bottom-[5%] inset-x-0 z-20 w-full flex justify-center p-0 pointer-events-none transition-all duration-500 transform translate-y-0 opacity-100">
          <div className="w-full pointer-events-auto animate-fade-in">
            <DialogueBox
              key={`dialogue-${currentNode.id}`}
              speaker={isGlitching ? 'SYSTEM GLITCH' : currentNode.speaker}
              portraitSrc={currentNode.portraitImage}
              text={
                isGlitching
                  ? '*** CRITICAL TEMPORAL ANOMALY: TRANSMISSION SEVERED ***'
                  : currentNode.dialogue
              }
              speed={isGlitching ? 'instant' : textSpeed}
              isAutoPlay={isAutoPlay}
              onAdvance={onAdvance}
              choices={isGlitching ? undefined : currentNode.choices}
              onSelectChoice={onSelectChoice}
              onToggleHide={() => setIsTextManuallyHidden(true)}
            />
          </div>
        </div>
      )}

      {/* Floating button when text is manually hidden so user can easily restore it */}
      {isTextManuallyHidden && !currentNode.hideTextBox && (
        <div className="absolute top-3 right-3 z-30 pointer-events-auto animate-fade-in">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTextManuallyHidden(false);
            }}
            className="px-2.5 py-1 bg-[#2B1B3C]/90 hover:bg-[#3E1843] border border-[#824B85] text-[#FAF5FF] font-pixel text-xs rounded-xs shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            title="Restore dialogue box (or click screen)"
          >
            <svg className="w-3.5 h-3.5 text-[#FBCFE8]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3c-4.4 0-8 5-8 5s3.6 5 8 5 8-5 8-5-3.6-5-8-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm0-5.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span>SHOW TEXT</span>
          </button>
        </div>
      )}
    </div>
  );
};
