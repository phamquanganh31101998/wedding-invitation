'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAudioContext } from './AudioContext';

/**
 * Custom hook for audio player functionality
 * Manages HTML5 Audio API interactions and state
 */
export const useAudioPlayer = () => {
  const { state, controls } = useAudioContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      audioRef.current.volume = state.volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // Update audio source when current track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    const loadNewTrack = async () => {
      try {
        controls.setLoading(true);
        controls.setError(false);

        // Stop current playback
        audio.pause();
        audio.currentTime = 0;

        // Set new source
        audio.src = state.currentTrack!.src;

        // Load the new track
        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            resolve(void 0);
          };

          const handleError = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            reject(new Error('Failed to load audio'));
          };

          audio.addEventListener('canplay', handleCanPlay);
          audio.addEventListener('error', handleError);
          audio.load();
        });

        controls.setLoading(false);
      } catch (error) {
        console.error('Error loading track:', error);
        controls.setError(true);
        controls.setLoading(false);
      }
    };

    loadNewTrack();
  }, [state.currentTrack, controls]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    if (state.isPlaying && !state.isLoading && !state.hasError) {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        controls.setError(true);
      });
    } else {
      audio.pause();
    }
  }, [
    state.isPlaying,
    state.isLoading,
    state.hasError,
    state.currentTrack,
    controls,
  ]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = state.volume;
    }
  }, [state.volume]);

  // Handle seek changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - state.currentTime) > 1) {
      audio.currentTime = state.currentTime;
    }
  }, [state.currentTime]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      controls.setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      controls.setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      controls.next();
    };

    const handleError = () => {
      console.error('Audio playback error');
      controls.setError(true);
    };

    const handleCanPlay = () => {
      controls.setLoading(false);
    };

    const handleWaiting = () => {
      controls.setLoading(true);
    };

    const handlePlaying = () => {
      controls.setLoading(false);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      // Remove event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [controls]);

  // Enhanced control functions with error handling
  const enhancedControls = {
    ...controls,
    play: useCallback(() => {
      if (state.hasError) {
        controls.setError(false);
      }
      if (state.playlist.length === 0) {
        console.warn('No tracks in playlist');
        return;
      }
      controls.play();
    }, [controls, state.playlist.length, state.hasError]),

    pause: useCallback(() => {
      controls.pause();
    }, [controls]),

    togglePlayPause: useCallback(() => {
      if (state.isPlaying) {
        controls.pause();
      } else {
        enhancedControls.play();
      }
    }, [state.isPlaying, controls]),

    seek: useCallback(
      (time: number) => {
        const audio = audioRef.current;
        if (audio && time >= 0 && time <= state.duration) {
          audio.currentTime = time;
          controls.setCurrentTime(time);
        }
      },
      [controls, state.duration]
    ),

    setVolume: useCallback(
      (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        controls.setVolume(clampedVolume);
      },
      [controls]
    ),
  };

  return {
    audioRef,
    ...state,
    ...enhancedControls,
  };
};
