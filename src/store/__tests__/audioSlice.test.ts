import { configureStore } from '@reduxjs/toolkit';
import audioReducer, {
  play,
  pause,
  setLoading,
  setError,
  loadPlaylist,
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
    // First load a playlist
    store.dispatch(loadPlaylist(mockTracks));

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
    store.dispatch(loadPlaylist(mockTracks));
    store.dispatch(play());
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
    store.dispatch(loadPlaylist(mockTracks));
    store.dispatch(play());

    store.dispatch(setError(true));

    const state = store.getState().audio;
    expect(state.hasError).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.isPlaying).toBe(false);
  });

  it('should handle loadPlaylist', () => {
    store.dispatch(loadPlaylist(mockTracks));

    const state = store.getState().audio;
    expect(state.playlist).toEqual(mockTracks);
    expect(state.currentTrack).toEqual(mockTracks[0]);
    expect(state.hasError).toBe(false);
  });

  it('should handle empty playlist', () => {
    store.dispatch(loadPlaylist([]));

    const state = store.getState().audio;
    expect(state.playlist).toEqual([]);
    expect(state.currentTrack).toBe(null);
  });
});
