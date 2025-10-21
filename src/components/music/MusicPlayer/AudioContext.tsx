'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { AudioState, AudioContextValue, Track } from '@/types';
import { useTabVisibility } from './useTabVisibility';
import { usePlaylist } from './usePlaylist';

// Initial audio state
const initialAudioState: AudioState = {
  isPlaying: false,
  isLoading: false,
  hasError: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  currentTrack: null,
  playlist: [],
  currentTrackIndex: -1,
};

// Audio context
const AudioContext = createContext<AudioContextValue | undefined>(undefined);

// Audio reducer for state management
type AudioAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_PLAYLIST'; payload: AudioState['playlist'] }
  | { type: 'SET_CURRENT_TRACK_INDEX'; payload: number }
  | { type: 'SET_CURRENT_TRACK'; payload: Track | null }
  | { type: 'RESET_ERROR' }
  | { type: 'LOAD_PREFERENCES'; payload: Partial<AudioState> };

const audioReducer = (state: AudioState, action: AudioAction): AudioState => {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload, hasError: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return {
        ...state,
        hasError: action.payload,
        isLoading: false,
        isPlaying: false,
      };
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.payload)) };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload,
        currentTrackIndex: action.payload.length > 0 ? 0 : -1,
        currentTrack: action.payload.length > 0 ? action.payload[0] : null,
      };
    case 'SET_CURRENT_TRACK_INDEX':
      const newIndex = action.payload;
      const newTrack = state.playlist[newIndex] || null;
      return {
        ...state,
        currentTrackIndex: newIndex,
        currentTrack: newTrack,
        currentTime: 0,
        duration: 0,
        hasError: false,
      };
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };
    case 'RESET_ERROR':
      return { ...state, hasError: false };
    case 'LOAD_PREFERENCES':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface AudioProviderProps {
  children: ReactNode;
}

/**
 * Audio Context Provider component
 * Manages global audio state across the application
 */
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialAudioState);
  const isTabVisible = useTabVisibility();
  const originalVolumeRef = useRef<number>(0.7);
  const persistenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load playlist automatically
  const playlist = usePlaylist();

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('musicPlayerPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        originalVolumeRef.current = preferences.volume || 0.7;
        dispatch({
          type: 'LOAD_PREFERENCES',
          payload: {
            volume: preferences.volume || 0.7,
            currentTrackIndex: preferences.currentTrackIndex || -1,
          },
        });
      }
    } catch (error) {
      console.warn('Failed to load music player preferences:', error);
    }
  }, []);

  // Update audio state when playlist changes
  useEffect(() => {
    if (playlist.tracks.length > 0) {
      dispatch({ type: 'SET_PLAYLIST', payload: playlist.tracks });

      // Set loading state based on playlist loading
      dispatch({ type: 'SET_LOADING', payload: playlist.isLoading });

      // Set error state if playlist has error
      if (playlist.error) {
        dispatch({ type: 'SET_ERROR', payload: true });
      }

    } else if (!playlist.isLoading && !playlist.error && state.playlist.length > 0) {
      // No tracks available but not loading or error - only clear if we had tracks before
      dispatch({ type: 'SET_PLAYLIST', payload: [] });
    }
  }, [playlist.tracks, playlist.isLoading, playlist.error, state.playlist.length]);

  // Sync current track index with playlist hook
  useEffect(() => {
    if (playlist.currentTrackIndex !== state.currentTrackIndex) {
      dispatch({
        type: 'SET_CURRENT_TRACK_INDEX',
        payload: playlist.currentTrackIndex,
      });
    }
  }, [playlist.currentTrackIndex, state.currentTrackIndex]);

  // Handle tab visibility changes with volume adjustment
  useEffect(() => {
    if (!state.isPlaying) return;

    if (!isTabVisible) {
      // Tab is hidden - reduce volume to 30% of original
      originalVolumeRef.current = state.volume;
      const reducedVolume = state.volume * 0.3;
      dispatch({ type: 'SET_VOLUME', payload: reducedVolume });
    } else {
      // Tab is visible - restore original volume
      dispatch({ type: 'SET_VOLUME', payload: originalVolumeRef.current });
    }
  }, [isTabVisible, state.isPlaying, state.volume]);

  // Debounced save preferences to localStorage when relevant state changes
  useEffect(() => {
    if (persistenceTimeoutRef.current) {
      clearTimeout(persistenceTimeoutRef.current);
    }

    persistenceTimeoutRef.current = setTimeout(() => {
      try {
        const preferences = {
          volume: originalVolumeRef.current, // Save the original volume, not the reduced one
          wasPlaying: state.isPlaying,
          lastPosition: state.currentTime,
          currentTrackIndex: state.currentTrackIndex,
          playlistIds: state.playlist.map((track) => track.id),
        };
        localStorage.setItem(
          'musicPlayerPreferences',
          JSON.stringify(preferences)
        );
      } catch (error) {
        console.warn('Failed to save music player preferences:', error);
      }
    }, 500); // Debounce for 500ms

    return () => {
      if (persistenceTimeoutRef.current) {
        clearTimeout(persistenceTimeoutRef.current);
      }
    };
  }, [
    state.volume,
    state.isPlaying,
    state.currentTime,
    state.currentTrackIndex,
    state.playlist,
  ]);

  // Handle page unload to save final state
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const preferences = {
          volume: originalVolumeRef.current,
          wasPlaying: state.isPlaying,
          lastPosition: state.currentTime,
          currentTrackIndex: state.currentTrackIndex,
          playlistIds: state.playlist.map((track) => track.id),
        };
        localStorage.setItem(
          'musicPlayerPreferences',
          JSON.stringify(preferences)
        );
      } catch (error) {
        console.warn(
          'Failed to save music player preferences on unload:',
          error
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    state.volume,
    state.isPlaying,
    state.currentTime,
    state.currentTrackIndex,
    state.playlist,
  ]);

  // Audio control functions
  const controls = {
    play: () => {
      if (state.playlist.length > 0 && state.currentTrackIndex >= 0) {
        dispatch({ type: 'SET_PLAYING', payload: true });
        dispatch({ type: 'RESET_ERROR' });
      }
    },
    pause: () => dispatch({ type: 'SET_PLAYING', payload: false }),
    next: () => {
      if (state.playlist.length === 0) return;
      playlist.nextTrack();
      const nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
      dispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: nextIndex });
    },
    previous: () => {
      if (state.playlist.length === 0) return;
      playlist.previousTrack();
      const prevIndex =
        state.currentTrackIndex > 0
          ? state.currentTrackIndex - 1
          : state.playlist.length - 1;
      dispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: prevIndex });
    },
    setVolume: (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
    },
    seek: (time: number) => {
      if (time >= 0 && time <= state.duration) {
        dispatch({ type: 'SET_CURRENT_TIME', payload: time });
      }
    },
    shufflePlaylist: () => {
      if (state.playlist.length <= 1) return;
      playlist.shufflePlaylist();
    },
    // State restoration function
    restorePlaybackState: () => {
      try {
        const savedPreferences = localStorage.getItem('musicPlayerPreferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);

          // Restore volume
          if (preferences.volume !== undefined) {
            originalVolumeRef.current = preferences.volume;
            dispatch({ type: 'SET_VOLUME', payload: preferences.volume });
          }

          // Restore track index if playlist is loaded
          if (
            preferences.currentTrackIndex !== undefined &&
            state.playlist.length > 0
          ) {
            const validIndex = Math.max(
              0,
              Math.min(preferences.currentTrackIndex, state.playlist.length - 1)
            );
            dispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: validIndex });
          }

          // Restore position if valid
          if (
            preferences.lastPosition !== undefined &&
            preferences.lastPosition > 0
          ) {
            dispatch({
              type: 'SET_CURRENT_TIME',
              payload: preferences.lastPosition,
            });
          }
        }
      } catch (error) {
        console.warn('Failed to restore playback state:', error);
      }
    },
    // Internal dispatch functions for use by hooks
    setLoading: (loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: boolean) =>
      dispatch({ type: 'SET_ERROR', payload: error }),
    setCurrentTime: (time: number) =>
      dispatch({ type: 'SET_CURRENT_TIME', payload: time }),
    setDuration: (duration: number) =>
      dispatch({ type: 'SET_DURATION', payload: duration }),
    setPlaylist: (playlist: Track[]) =>
      dispatch({ type: 'SET_PLAYLIST', payload: playlist }),
    setCurrentTrackIndex: (index: number) =>
      dispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: index }),
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
