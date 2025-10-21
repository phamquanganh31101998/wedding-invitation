import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from '../useAudioPlayer';
import { AudioProvider } from '../AudioContext';
import { ReactNode } from 'react';

// Mock HTML5 Audio API
class MockAudio {
  src = '';
  volume = 1;
  currentTime = 0;
  duration = 0;
  paused = true;
  preload = 'metadata';

  private listeners: { [key: string]: EventListener[] } = {};

  addEventListener(event: string, listener: EventListener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  removeEventListener(event: string, listener: EventListener) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
  }

  dispatchEvent(event: Event) {
    const eventListeners = this.listeners[event.type] || [];
    eventListeners.forEach(listener => listener(event));
    return true;
  }

  async play() {
    this.paused = false;
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {
    // Simulate successful load
    setTimeout(() => {
      this.duration = 180; // 3 minutes
      this.dispatchEvent(new Event('loadedmetadata'));
      this.dispatchEvent(new Event('canplay'));
    }, 10);
  }

  // Helper method to simulate time updates
  simulateTimeUpdate(time: number) {
    this.currentTime = time;
    this.dispatchEvent(new Event('timeupdate'));
  }

  // Helper method to simulate track end
  simulateEnd() {
    this.dispatchEvent(new Event('ended'));
  }

  // Helper method to simulate error
  simulateError() {
    this.dispatchEvent(new Event('error'));
  }
}

// Mock the Audio constructor
global.Audio = MockAudio as any;

// Mock usePlaylist hook
jest.mock('../usePlaylist', () => ({
  usePlaylist: () => ({
    tracks: [],
    currentTrackIndex: 0,
    currentTrack: null,
    isLoading: false,
    error: null,
    hasNext: false,
    hasPrevious: false,
    loadTracks: jest.fn(),
    nextTrack: jest.fn(),
    previousTrack: jest.fn(),
    shufflePlaylist: jest.fn(),
    setTrackByIndex: jest.fn(),
    setTrackById: jest.fn(),
  }),
}));

// Mock useTabVisibility hook
jest.mock('../useTabVisibility', () => ({
  useTabVisibility: () => true,
}));

// Create wrapper component with AudioProvider
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <AudioProvider>{children}</AudioProvider>
  );
};

describe('useAudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.volume).toBe(0.7); // Default volume from context
    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(result.current.currentTrack).toBeNull();
    expect(result.current.playlist).toEqual([]);
  });

  it('should create audio element on mount', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    expect(result.current.audioRef.current).toBeInstanceOf(MockAudio);
  });

  it('should handle play action when playlist is empty', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    // Try to play with empty playlist
    act(() => {
      result.current.play();
    });

    // Should not start playing with empty playlist
    expect(result.current.isPlaying).toBe(false);
  });

  it('should toggle play/pause with empty playlist', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    // Toggle with empty playlist should not change state
    act(() => {
      result.current.togglePlayPause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should handle volume changes', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(result.current.volume).toBe(0.5);
    expect(result.current.audioRef.current?.volume).toBe(0.5);
  });

  it('should clamp volume to valid range', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setVolume(1.5); // Above max
    });

    expect(result.current.volume).toBe(1);

    act(() => {
      result.current.setVolume(-0.5); // Below min
    });

    expect(result.current.volume).toBe(0);
  });

  it('should clear error state when playing after error', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    // Set error state first
    act(() => {
      result.current.setError(true);
    });

    expect(result.current.hasError).toBe(true);

    // Playing should clear error state (even with empty playlist)
    act(() => {
      result.current.play();
    });

    // Error should be cleared even though play didn't succeed
    expect(result.current.hasError).toBe(false);
  });
});