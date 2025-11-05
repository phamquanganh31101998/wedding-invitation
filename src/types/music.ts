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
  currentTrackIndex: number;
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
