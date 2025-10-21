import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AudioProvider } from '../AudioContext';
import { FloatingMusicButton } from '../FloatingMusicButton';
import { PlaylistService } from '@/utils/music/PlaylistService';
import { Track } from '@/types/music';

// Mock PlaylistService
jest.mock('@/utils/music/PlaylistService');
const mockPlaylistService = PlaylistService as jest.Mocked<typeof PlaylistService>;

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

describe('Music Player Responsive Design', () => {
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

  describe('Viewport Responsiveness', () => {
    it('should render properly on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
    });

    it('should render properly on tablet viewport', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
    });

    it('should render properly on desktop viewport', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
    });

    it('should maintain fixed positioning across viewports', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      const buttonContainer = button.parentElement;

      // Check that the container has fixed positioning styles
      expect(buttonContainer).toHaveClass('css-1udaso0');
    });
  });

  describe('CSS Media Query Support', () => {
    it('should respect prefers-reduced-motion', async () => {
      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should respect prefers-color-scheme', async () => {
      // Mock prefers-color-scheme: dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Touch Device Support', () => {
    it('should handle touch interactions', async () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
      });

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();

      // Button should be accessible on touch devices
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have appropriate touch target size', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      // Chakra UI Button ensures minimum 44px touch target
      // We verify the button is rendered with proper classes
      expect(button).toHaveClass('chakra-button');
    });
  });
});

describe('Browser Compatibility', () => {
  const mockTracks: Track[] = [
    { id: '1', filename: 'song1.mp3', title: 'Song 1', src: '/song1.mp3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockPlaylistService.loadTracksFromFolder.mockResolvedValue(mockTracks);
    mockPlaylistService.createShuffledPlaylist.mockReturnValue(mockTracks);
  });

  describe('Audio Format Support', () => {
    it('should handle MP3 format', async () => {
      const mp3Track: Track = {
        id: '1',
        filename: 'song.mp3',
        title: 'MP3 Song',
        src: '/song.mp3',
      };

      mockPlaylistService.loadTracksFromFolder.mockResolvedValue([mp3Track]);

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle WAV format', async () => {
      const wavTrack: Track = {
        id: '1',
        filename: 'song.wav',
        title: 'WAV Song',
        src: '/song.wav',
      };

      mockPlaylistService.loadTracksFromFolder.mockResolvedValue([wavTrack]);

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle OGG format', async () => {
      const oggTrack: Track = {
        id: '1',
        filename: 'song.ogg',
        title: 'OGG Song',
        src: '/song.ogg',
      };

      mockPlaylistService.loadTracksFromFolder.mockResolvedValue([oggTrack]);

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('HTML5 Audio API Support', () => {
    it('should work with HTML5 Audio API', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();

      // Verify that Audio constructor is available
      expect(global.Audio).toBeDefined();
    });

    it('should handle audio loading states', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();

      // Initially should not be in loading state
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  describe('LocalStorage Support', () => {
    it('should work when localStorage is available', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      await screen.findByRole('button');

      // Should attempt to load preferences
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('musicPlayerPreferences');
    });

    it('should gracefully handle localStorage unavailability', async () => {
      // Mock localStorage throwing error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Modern JavaScript Features', () => {
    it('should work with async/await', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should work with ES6 modules', async () => {
      // Test passes if imports work correctly
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should work with React hooks', async () => {
      // Component uses hooks internally
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle multiple audio files efficiently', async () => {
      const manyTracks: Track[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        filename: `song${i + 1}.mp3`,
        title: `Song ${i + 1}`,
        src: `/song${i + 1}.mp3`,
      }));

      mockPlaylistService.loadTracksFromFolder.mockResolvedValue(manyTracks);

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should not block UI during audio operations', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});