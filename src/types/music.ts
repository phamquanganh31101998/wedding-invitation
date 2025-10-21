/**
 * Music Player Type Definitions
 */

export interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration: number;
}

// Simplified audio state to match Redux slice
export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  playlist: Track[];
  currentTrack: Track | null;
}

export interface AudioConfig {
  autoplay: boolean;
  loop: boolean;
  shuffle: boolean;
  preload: 'none' | 'metadata' | 'auto';
}

export interface PlaylistConfig {
  musicFolder: string;
  supportedFormats: string[];
  shuffleOnLoad: boolean;
}

export interface AudioPreferences {
  volume: number;
  wasPlaying: boolean;
  lastPosition: number;
  currentTrackIndex: number;
  shuffledPlaylist: string[];
}

// Simplified audio context value to match our implementation
export interface AudioContextValue {
  state: AudioState;
  controls: {
    play: () => void;
    pause: () => void;
    loadMusic: () => Promise<void>;
  };
}

export interface MusicPlayerProps {
  theme?: 'light' | 'dark';
}

export interface ErrorRecovery {
  maxRetries: number;
  retryDelay: number;
  fallbackBehavior: 'hide' | 'show-error' | 'retry';
}

export interface A11yAttributes {
  'aria-label': string;
  'aria-pressed': boolean;
  'aria-describedby': string;
  role: 'button';
}

export interface TracksResponse {
  tracks: {
    filename: string;
    title: string;
    artist?: string;
    src: string;
  }[];
}
