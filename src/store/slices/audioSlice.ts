import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track, AudioState } from '@/types';

const initialState: AudioState = {
  isPlaying: false,
  isLoading: false,
  hasError: false,
  playlist: [],
  currentTrack: null,
  currentTrackIndex: -1,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    play: (state) => {
      if (state.currentTrack) {
        state.isPlaying = true;
        state.hasError = false;
      }
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.hasError = action.payload;
      state.isLoading = false;
      state.isPlaying = false;
    },
    loadPlaylist: (state, action: PayloadAction<Track[]>) => {
      state.playlist = action.payload;

      if (action.payload.length > 0) {
        // Select a random track instead of always the first one
        const randomIndex = Math.floor(Math.random() * action.payload.length);
        state.currentTrackIndex = randomIndex;
        state.currentTrack = action.payload[randomIndex];
        state.hasError = false;
        // Auto play when playlist loads successfully
        state.isPlaying = true;
      } else {
        state.currentTrackIndex = -1;
        state.currentTrack = null;
      }
    },
    nextTrack: (state) => {
      if (state.playlist.length === 0) return;

      // Select a random track from the playlist (excluding current track if possible)
      let nextIndex: number;

      if (state.playlist.length === 1) {
        // If only one track, keep playing the same track
        nextIndex = 0;
      } else {
        // Select a random track that's different from the current one
        do {
          nextIndex = Math.floor(Math.random() * state.playlist.length);
        } while (nextIndex === state.currentTrackIndex);
      }

      state.currentTrackIndex = nextIndex;
      state.currentTrack = state.playlist[nextIndex];
      state.hasError = false;
      // Keep playing when moving to next track
      state.isPlaying = true;
    },
  },
});

export const { play, pause, setLoading, setError, loadPlaylist, nextTrack } =
  audioSlice.actions;

export default audioSlice.reducer;
