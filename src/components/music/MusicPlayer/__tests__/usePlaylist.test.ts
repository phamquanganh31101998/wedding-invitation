import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlaylist } from '../usePlaylist';
import { PlaylistService } from '@/utils/music/PlaylistService';
import { Track } from '@/types/music';

// Mock PlaylistService
jest.mock('@/utils/music/PlaylistService');
const mockPlaylistService = PlaylistService as jest.Mocked<
  typeof PlaylistService
>;

describe('usePlaylist', () => {
  const mockTracks: Track[] = [
    { id: '1', filename: 'song1.mp3', title: 'Song 1', src: '/song1.mp3' },
    { id: '2', filename: 'song2.mp3', title: 'Song 2', src: '/song2.mp3' },
    { id: '3', filename: 'song3.mp3', title: 'Song 3', src: '/song3.mp3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlaylistService.loadTracksFromFolder.mockResolvedValue(mockTracks);
    mockPlaylistService.createShuffledPlaylist.mockReturnValue(
      [...mockTracks].reverse()
    );
    mockPlaylistService.shuffleArray.mockReturnValue([...mockTracks].reverse());
    mockPlaylistService.getNextTrack.mockImplementation((tracks, index) =>
      tracks.length === 0 ? -1 : (index + 1) % tracks.length
    );
    mockPlaylistService.getPreviousTrack.mockImplementation((tracks, index) =>
      tracks.length === 0 ? -1 : index <= 0 ? tracks.length - 1 : index - 1
    );
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePlaylist());

    expect(result.current.tracks).toEqual([]);
    expect(result.current.currentTrackIndex).toBe(0);
    expect(result.current.currentTrack).toBeNull();
    expect(result.current.isLoading).toBe(true); // Loading on mount
    expect(result.current.error).toBeNull();
    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrevious).toBe(false);
  });

  it('should load tracks on mount with shuffle enabled by default', async () => {
    const { result } = renderHook(() => usePlaylist());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPlaylistService.loadTracksFromFolder).toHaveBeenCalledWith(
      'data/musics'
    );
    expect(mockPlaylistService.createShuffledPlaylist).toHaveBeenCalledWith(
      mockTracks
    );
    expect(result.current.tracks).toEqual([...mockTracks].reverse());
    expect(result.current.currentTrack).toEqual(mockTracks[2]); // First in reversed array
  });

  it('should load tracks without shuffle when configured', async () => {
    mockPlaylistService.loadTracksFromFolder.mockResolvedValue(mockTracks);

    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPlaylistService.createShuffledPlaylist).not.toHaveBeenCalled();
    expect(result.current.tracks).toEqual(mockTracks);
    expect(result.current.currentTrack).toEqual(mockTracks[0]);
  });

  it('should handle loading error', async () => {
    const errorMessage = 'Failed to load tracks';
    mockPlaylistService.loadTracksFromFolder.mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => usePlaylist());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.tracks).toEqual([]);
  });

  it('should handle empty tracks response', async () => {
    mockPlaylistService.loadTracksFromFolder.mockResolvedValue([]);

    const { result } = renderHook(() => usePlaylist());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('No music tracks found');
    expect(result.current.tracks).toEqual([]);
  });

  it('should navigate to next track', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.nextTrack();
    });

    expect(result.current.currentTrackIndex).toBe(1);
    expect(result.current.currentTrack).toEqual(mockTracks[1]);
  });

  it('should navigate to previous track', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Move to second track first
    act(() => {
      result.current.nextTrack();
    });

    act(() => {
      result.current.previousTrack();
    });

    expect(result.current.currentTrackIndex).toBe(0);
    expect(result.current.currentTrack).toEqual(mockTracks[0]);
  });

  it('should shuffle playlist and maintain current track', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const currentTrack = result.current.currentTrack;

    act(() => {
      result.current.shufflePlaylist();
    });

    expect(mockPlaylistService.shuffleArray).toHaveBeenCalledWith(mockTracks);
    expect(result.current.tracks).toEqual([...mockTracks].reverse());
    // Current track should be maintained (found in new position)
    expect(result.current.currentTrack).toEqual(currentTrack);
  });

  it('should set track by index', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setTrackByIndex(2);
    });

    expect(result.current.currentTrackIndex).toBe(2);
    expect(result.current.currentTrack).toEqual(mockTracks[2]);
  });

  it('should ignore invalid track index', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const originalIndex = result.current.currentTrackIndex;

    act(() => {
      result.current.setTrackByIndex(-1);
    });

    expect(result.current.currentTrackIndex).toBe(originalIndex);

    act(() => {
      result.current.setTrackByIndex(999);
    });

    expect(result.current.currentTrackIndex).toBe(originalIndex);
  });

  it('should set track by ID', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setTrackById('2');
    });

    expect(result.current.currentTrackIndex).toBe(1);
    expect(result.current.currentTrack).toEqual(mockTracks[1]);
  });

  it('should ignore invalid track ID', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const originalIndex = result.current.currentTrackIndex;

    act(() => {
      result.current.setTrackById('invalid-id');
    });

    expect(result.current.currentTrackIndex).toBe(originalIndex);
  });

  it('should calculate hasNext and hasPrevious correctly', async () => {
    const { result } = renderHook(() => usePlaylist({ shuffleOnLoad: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // At first track
    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrevious).toBe(false);

    // Move to middle track
    act(() => {
      result.current.setTrackByIndex(1);
    });

    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrevious).toBe(true);

    // Move to last track
    act(() => {
      result.current.setTrackByIndex(2);
    });

    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrevious).toBe(true);
  });

  it('should reload tracks when loadTracks is called', async () => {
    const { result } = renderHook(() => usePlaylist());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear the mock to test reload
    mockPlaylistService.loadTracksFromFolder.mockClear();

    act(() => {
      result.current.loadTracks();
    });

    expect(result.current.isLoading).toBe(true);
    expect(mockPlaylistService.loadTracksFromFolder).toHaveBeenCalledTimes(1);
  });
});
