'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { AudioContextValue, AudioState } from '@/types';

import { useTenant } from '@/components/providers/TenantProvider';
import { useGetTrackList } from '@/features/music/services/music.hooks';

// Audio context
const AudioContext = createContext<AudioContextValue | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

/**
 * Simplified Audio Context Provider component
 * Manages basic audio state: play, pause, and load music from API using React Query
 */
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const { tenantSlug } = useTenant();

  // Local audio state (replacing Redux)
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTrack: null,
    playlist: [],
    currentTrackIndex: 0,
    isLoading: false,
    hasError: false,
  });

  // Audio player will be initialized by components that need it

  // Use React Query to fetch tracks
  const {
    data: tracks,
    isLoading,
    error,
    refetch,
  } = useGetTrackList(tenantSlug || undefined, {
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update local state based on React Query state
  useEffect(() => {
    setAudioState((prev) => ({ ...prev, isLoading }));
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      console.error('Error loading music:', error);
      setAudioState((prev) => ({ ...prev, hasError: true }));
    } else {
      setAudioState((prev) => ({ ...prev, hasError: false }));
    }
  }, [error]);

  useEffect(() => {
    if (tracks && tracks.length > 0) {
      setAudioState((prev) => ({
        ...prev,
        playlist: tracks,
        currentTrack: tracks[0] || null,
        currentTrackIndex: 0,
      }));
    }
  }, [tracks]);

  // Audio control functions
  const controls = {
    play: () => {
      setAudioState((prev) => ({
        ...prev,
        isPlaying: true,
        hasError: false, // Clear any previous errors when trying to play
      }));
    },
    pause: () => {
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
    },
    setError: (hasError: boolean) => {
      setAudioState((prev) => ({ ...prev, hasError, isPlaying: false }));
    },
    loadMusic: async () => {
      await refetch();
    },
  };

  const contextValue: AudioContextValue = {
    state: audioState,
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
