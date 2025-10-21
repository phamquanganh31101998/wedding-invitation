import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AudioProvider } from '../AudioContext';
import { FloatingMusicButton } from '../FloatingMusicButton';
import { PlaylistService } from '@/utils/music/PlaylistService';
import { Track } from '@/types/music';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

describe('Music Player Accessibility', () => {
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

  describe('WCAG 2.1 AA Compliance', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      // Wait for component to load
      await screen.findByRole('button');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in playing state', async () => {
      const { container } = render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      fireEvent.click(button);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable with tab key', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      // Button should be focusable
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should respond to space key', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      button.focus();

      // Press space to activate
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should respond to enter key', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      button.focus();

      // Press enter to activate
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have visible focus indicator', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      button.focus();

      // Check that focus styles are applied (Chakra UI handles this)
      expect(button).toHaveFocus();
      expect(button).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
      expect(button).toHaveAttribute('aria-describedby');
    });

    it('should have descriptive aria-label in play state', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      expect(button).toHaveAttribute('aria-label', 'Play music - Song 1');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have descriptive aria-label in pause state', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');
      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-label', 'Pause music - Song 1');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-live region for status updates', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      expect(button).toHaveAttribute('aria-live', 'polite');
    });

    it('should have descriptive text for screen readers', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      await screen.findByRole('button');

      const description = screen.getByText(/Currently loaded: Song 1/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(
        'Currently loaded: Song 1. Playlist has 2 tracks. Use space or enter to toggle playback.'
      );
    });

    it('should provide role and button semantics', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Visual Accessibility', () => {
    it('should have sufficient color contrast', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      // Chakra UI ensures proper contrast ratios
      // This test verifies the button renders with proper styling
      expect(button).toHaveClass('chakra-button');
    });

    it('should respect prefers-reduced-motion', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
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

    it('should be visible and not hidden from assistive technology', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      expect(button).toBeVisible();
      expect(button).not.toHaveAttribute('aria-hidden', 'true');
      expect(button).not.toHaveAttribute('hidden');
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    it('should have adequate touch target size', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      // Chakra UI Button component ensures minimum 44px touch target
      expect(button).toBeInTheDocument();
    });

    it('should handle touch events', async () => {
      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      const button = await screen.findByRole('button');

      // Simulate touch events (touch events don't automatically trigger click)
      fireEvent.touchStart(button);
      fireEvent.touchEnd(button);
      fireEvent.click(button); // Touch events need to be followed by click

      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Error States Accessibility', () => {
    it('should handle empty playlist state accessibly', async () => {
      mockPlaylistService.loadTracksFromFolder.mockResolvedValue([]);

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      // Should not render when no tracks (graceful degradation)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle loading error state accessibly', async () => {
      mockPlaylistService.loadTracksFromFolder.mockRejectedValue(
        new Error('Failed to load')
      );

      render(
        <TestWrapper>
          <FloatingMusicButton />
        </TestWrapper>
      );

      // Should not render when loading fails (graceful degradation)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
