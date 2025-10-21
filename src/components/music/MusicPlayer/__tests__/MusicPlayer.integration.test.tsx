import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AudioProvider } from '../AudioContext';
import { FloatingMusicButton } from '../FloatingMusicButton';
import { PlaylistService } from '@/utils/music/PlaylistService';
import { Track } from '@/types/music';

// Mock PlaylistService
jest.mock('@/utils/music/PlaylistService');
const mockPlaylistService = PlaylistService as jest.Mocked<
  typeof PlaylistService
>;

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
      this.listeners[event] = this.listeners[event].filter(
        (l) => l !== listener
      );
    }
  }

  dispatchEvent(event: Event) {
    const eventListeners = this.listeners[event.type] || [];
    eventListeners.forEach((listener) => listener(event));
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
    setTimeout(() => {
      this.duration = 180;
      this.dispatchEvent(new Event('loadedmetadata'));
      this.dispatchEvent(new Event('canplay'));
    }, 10);
  }
}

global.Audio = MockAudio as any;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    <AudioProvider>{children}</AudioProvider>
  </ChakraProvider>
);

describe('Music Player Integration', () => {
  const mockTracks: Track[] = [
    { id: '1', filename: 'song1.mp3', title: 'Song 1', src: '/song1.mp3' },
    { id: '2', filename: 'song2.mp3', title: 'Song 2', src: '/song2.mp3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockPlaylistService.loadTracksFromFolder.mockResolvedValue(mockTracks);
    mockPlaylistService.createShuffledPlaylist.mockReturnValue(mockTracks);
    mockPlaylistService.shuffleArray.mockReturnValue(mockTracks);
    mockPlaylistService.getNextTrack.mockImplementation((tracks, index) =>
      tracks.length === 0 ? -1 : (index + 1) % tracks.length
    );
    mockPlaylistService.getPreviousTrack.mockImplementation((tracks, index) =>
      tracks.length === 0 ? -1 : index <= 0 ? tracks.length - 1 : index - 1
    );
  });

  it('should render floating music button when tracks are loaded', async () => {
    render(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Play music - Song 1');
  });

  it('should toggle play/pause when button is clicked', async () => {
    render(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');

    // Initially should show play state
    expect(button).toHaveAttribute('aria-label', 'Play music - Song 1');

    // Click to play
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Pause music - Song 1');
    });

    // Click to pause
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Play music - Song 1');
    });
  });

  it('should handle keyboard navigation', async () => {
    render(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');

    // Focus the button
    button.focus();
    expect(button).toHaveFocus();

    // Press space to toggle
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Pause music - Song 1');
    });

    // Press enter to toggle
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Play music - Song 1');
    });
  });

  it('should persist volume settings in localStorage', async () => {
    render(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // Verify localStorage is called for loading preferences
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
      'musicPlayerPreferences'
    );
  });

  it('should handle empty playlist gracefully', async () => {
    mockPlaylistService.loadTracksFromFolder.mockResolvedValue([]);

    render(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    // Should not render button when no tracks
    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('should handle playlist loading errors', async () => {
    mockPlaylistService.loadTracksFromFolder.mockRejectedValue(
      new Error('Failed to load tracks')
    );

    render(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    // Should not render button when loading fails
    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('should maintain state across component re-renders', async () => {
    const { rerender } = render(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');

    // Start playing
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Pause music - Song 1');
    });

    // Re-render component
    rerender(
      <TestWrapper>
        <FloatingMusicButton />
      </TestWrapper>
    );

    // State should be maintained
    await waitFor(() => {
      const newButton = screen.getByRole('button');
      expect(newButton).toHaveAttribute('aria-label', 'Pause music - Song 1');
    });
  });
});
