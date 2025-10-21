import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track, AudioState } from '@/types';

const initialState: AudioState = {
  isPlaying: false,
  isLoading: false,
  hasError: false,
  playlist: [],
  currentTrack: null,
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
      state.currentTrack = action.payload.length > 0 ? action.payload[0] : null;
      state.hasError = false;
    },
  },
});

export const { play, pause, setLoading, setError, loadPlaylist } =
  audioSlice.actions;

export default audioSlice.reducer;
