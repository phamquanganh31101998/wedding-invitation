import { configureStore } from '@reduxjs/toolkit';
import audioReducer, {
  play,
  pause,
  setLoading,
  setError,
  loadPlaylist,
  nextTrack,
} from '../slices/audioSlice';
import { Track } from '@/types';

// Mock tracks for testing
const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Song 1',
    artist: 'Artist 1',
    url: '/music/song1.mp3',
    duration: 180,
  },
  {
    id: '2',
    title: 'Song 2',
    artist: 'Artist 2',
    url: '/music/song2.mp3',
    duration: 200,
  },
];

describe('audioSlice - Simplified', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        audio: audioReducer,
      },
    });
  });

  it('should handle play action', () => {
    // First load a playlist (no auto-play)
    store.dispatch(loadPlaylist(mockTracks));
    expect(store.getState().audio.isPlaying).toBe(false);

    // Then play
    store.dispatch(play());

    const state = store.getState().audio;
    expect(state.isPlaying).toBe(true);
    expect(state.hasError).toBe(false);
  });

  it('should not play if no current track', () => {
    store.dispatch(play());

    const state = store.getState().audio;
    expect(state.isPlaying).toBe(false);
  });

  it('should handle pause action', () => {
    store.dispatch(loadPlaylist(mockTracks)); // No auto-play
    store.dispatch(play()); // Start playing
    store.dispatch(pause());

    const state = store.getState().audio;
    expect(state.isPlaying).toBe(false);
  });

  it('should handle setLoading', () => {
    store.dispatch(setLoading(true));
    expect(store.getState().audio.isLoading).toBe(true);

    store.dispatch(setLoading(false));
    expect(store.getState().audio.isLoading).toBe(false);
  });

  it('should handle setError', () => {
    store.dispatch(loadPlaylist(mockTracks)); // No auto-play
    store.dispatch(play()); // Start playing

    store.dispatch(setError(true));

    const state = store.getState().audio;
    expect(state.hasError).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.isPlaying).toBe(false);
  });

  it('should handle loadPlaylist with random track selection (no auto-play)', () => {
    store.dispatch(loadPlaylist(mockTracks));

    const state = store.getState().audio;
    expect(state.playlist).toEqual(mockTracks);

    // Should select a random track (could be any track in the playlist)
    expect(state.currentTrackIndex).toBeGreaterThanOrEqual(0);
    expect(state.currentTrackIndex).toBeLessThan(mockTracks.length);
    expect(state.currentTrack).toEqual(mockTracks[state.currentTrackIndex]);

    expect(state.hasError).toBe(false);
    expect(state.isPlaying).toBe(false); // No auto-play - wait for user interaction
  });

  it('should handle empty playlist', () => {
    store.dispatch(loadPlaylist([]));

    const state = store.getState().audio;
    expect(state.playlist).toEqual([]);
    expect(state.currentTrack).toBe(null);
    expect(state.currentTrackIndex).toBe(-1);
    expect(state.isPlaying).toBe(false);
  });

  it('should handle nextTrack with random selection', () => {
    store.dispatch(loadPlaylist(mockTracks));
    const initialIndex = store.getState().audio.currentTrackIndex;

    store.dispatch(nextTrack());

    const state = store.getState().audio;

    // Should select a valid track index
    expect(state.currentTrackIndex).toBeGreaterThanOrEqual(0);
    expect(state.currentTrackIndex).toBeLessThan(mockTracks.length);

    // Should select a different track (if more than one track available)
    if (mockTracks.length > 1) {
      expect(state.currentTrackIndex).not.toBe(initialIndex);
    }

    expect(state.currentTrack).toEqual(mockTracks[state.currentTrackIndex]);
    expect(state.isPlaying).toBe(true);
  });

  it('should handle single track playlist', () => {
    // Create a single track playlist
    const singleTrack = [mockTracks[0]];
    store.dispatch(loadPlaylist(singleTrack));

    // Should start with the only track
    expect(store.getState().audio.currentTrackIndex).toBe(0);

    // Next track should stay on the same track (only option)
    store.dispatch(nextTrack());

    const state = store.getState().audio;
    expect(state.currentTrackIndex).toBe(0);
    expect(state.currentTrack).toEqual(singleTrack[0]);
    expect(state.isPlaying).toBe(true);
  });

  it('should select different random tracks on multiple nextTrack calls', () => {
    // Create a larger playlist for better randomness testing
    const largerPlaylist = [
      ...mockTracks,
      {
        id: '3',
        title: 'Song 3',
        artist: 'Artist 3',
        url: '/music/song3.mp3',
        duration: 220,
      },
      {
        id: '4',
        title: 'Song 4',
        artist: 'Artist 4',
        url: '/music/song4.mp3',
        duration: 240,
      },
      {
        id: '5',
        title: 'Song 5',
        artist: 'Artist 5',
        url: '/music/song5.mp3',
        duration: 260,
      },
    ];

    store.dispatch(loadPlaylist(largerPlaylist));

    const selectedIndices: number[] = [];
    selectedIndices.push(store.getState().audio.currentTrackIndex);

    // Call nextTrack multiple times and collect indices
    for (let i = 0; i < 10; i++) {
      store.dispatch(nextTrack());
      selectedIndices.push(store.getState().audio.currentTrackIndex);
    }

    // All indices should be valid
    selectedIndices.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(largerPlaylist.length);
    });

    // Should have some variety in selections
    const uniqueIndices = new Set(selectedIndices);
    expect(uniqueIndices.size).toBeGreaterThan(1);
  });

  it('should require user interaction to start playing', () => {
    // Load playlist
    store.dispatch(loadPlaylist(mockTracks));

    // Should not be playing initially
    expect(store.getState().audio.isPlaying).toBe(false);
    expect(store.getState().audio.currentTrack).not.toBe(null);

    // User clicks play button
    store.dispatch(play());

    // Now should be playing
    expect(store.getState().audio.isPlaying).toBe(true);
  });
});
