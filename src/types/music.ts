/**
 * Music Player Type Definitions
 */

export interface Track {
  id: string;
  filename: string;
  title: string;
  artist?: string;
  src: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  currentTrack: Track | null;
  playlist: Track[];
  currentTrackIndex: number;
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

export interface AudioContextValue {
  state: AudioState;
  controls: {
    play: () => void;
    pause: () => void;
    next: () => void;
    previous: () => void;
    setVolume: (volume: number) => void;
    seek: (time: number) => void;
    shufflePlaylist: () => void;
    restorePlaybackState: () => void;
    // Internal functions for hooks
    setLoading: (loading: boolean) => void;
    setError: (error: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setPlaylist: (playlist: Track[]) => void;
    setCurrentTrackIndex: (index: number) => void;
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
