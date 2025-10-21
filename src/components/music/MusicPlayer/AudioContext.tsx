'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { Track, AudioContextValue } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  play,
  pause,
  setLoading,
  setError,
  loadPlaylist,
} from '@/store/slices/audioSlice';
import { useAudioPlayer } from './useAudioPlayer';

// Audio context
const AudioContext = createContext<AudioContextValue | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

/**
 * Simplified Audio Context Provider component
 * Manages basic audio state: play, pause, and load music from API
 */
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.audio);

  // Initialize audio player (handles actual audio playback)
  useAudioPlayer();

  // Load music from API
  const loadMusic = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      const response = await fetch('/api/music/tracks');
      if (!response.ok) {
        throw new Error('Failed to load music');
      }

      const tracks: Track[] = await response.json();
      dispatch(loadPlaylist(tracks));
    } catch {
      dispatch(setError(true));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Load music on mount
  useEffect(() => {
    loadMusic();
  }, [loadMusic]);

  // Audio control functions
  const controls = {
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
    loadMusic,
  };

  const contextValue: AudioContextValue = {
    state,
    controls,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

/**
 * Custom hook to access audio context
 */
export const useAudioContext = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

export { AudioContext };
