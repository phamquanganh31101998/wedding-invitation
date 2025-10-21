'use client';

import { useState, useEffect, useCallback } from 'react';
import { Track, PlaylistConfig } from '@/types/music';
import { PlaylistService } from '@/utils/music/PlaylistService';

const defaultConfig: PlaylistConfig = {
  musicFolder: 'data/musics',
  supportedFormats: ['.mp3', '.wav', '.ogg'],
  shuffleOnLoad: true,
};

/**
 * Custom hook for playlist management
 * Handles track loading, shuffling, and navigation
 */
export const usePlaylist = (config: Partial<PlaylistConfig> = {}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalConfig = { ...defaultConfig, ...config };

  // Load tracks from API using PlaylistService
  const loadTracks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedTracks = await PlaylistService.loadTracksFromFolder(
        finalConfig.musicFolder
      );

      if (loadedTracks.length === 0) {
        setError('No music tracks found');
        setTracks([]);
        return;
      }

      // Shuffle tracks if configured to do so
      const finalTracks = finalConfig.shuffleOnLoad
        ? PlaylistService.createShuffledPlaylist(loadedTracks)
        : loadedTracks;

      setTracks(finalTracks);
      setCurrentTrackIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks');
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, [finalConfig.musicFolder, finalConfig.shuffleOnLoad]);

  // Navigate to next track
  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;

    const nextIndex = PlaylistService.getNextTrack(tracks, currentTrackIndex);
    setCurrentTrackIndex(nextIndex);
  }, [tracks, currentTrackIndex]);

  // Navigate to previous track
  const previousTrack = useCallback(() => {
    if (tracks.length === 0) return;

    const prevIndex = PlaylistService.getPreviousTrack(
      tracks,
      currentTrackIndex
    );
    setCurrentTrackIndex(prevIndex);
  }, [tracks, currentTrackIndex]);

  // Shuffle the current playlist
  const shufflePlaylist = useCallback(() => {
    if (tracks.length === 0) return;

    const currentTrack = tracks[currentTrackIndex];
    const shuffledTracks = PlaylistService.shuffleArray(tracks);

    // Find the current track in the shuffled array to maintain playback
    const newIndex = shuffledTracks.findIndex(
      (track) => track.id === currentTrack?.id
    );

    setTracks(shuffledTracks);
    setCurrentTrackIndex(newIndex >= 0 ? newIndex : 0);
  }, [tracks, currentTrackIndex]);

  // Get current track
  const getCurrentTrack = useCallback((): Track | null => {
    if (
      tracks.length === 0 ||
      currentTrackIndex < 0 ||
      currentTrackIndex >= tracks.length
    ) {
      return null;
    }
    return tracks[currentTrackIndex];
  }, [tracks, currentTrackIndex]);

  // Set specific track by index
  const setTrackByIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < tracks.length) {
        setCurrentTrackIndex(index);
      }
    },
    [tracks.length]
  );

  // Set specific track by ID
  const setTrackById = useCallback(
    (trackId: string) => {
      const index = tracks.findIndex((track) => track.id === trackId);
      if (index >= 0) {
        setCurrentTrackIndex(index);
      }
    },
    [tracks]
  );

  // Load tracks on mount
  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  return {
    // State
    tracks,
    currentTrackIndex,
    currentTrack: getCurrentTrack(),
    isLoading,
    error,
    hasNext: tracks.length > 0 && currentTrackIndex < tracks.length - 1,
    hasPrevious: tracks.length > 0 && currentTrackIndex > 0,

    // Actions
    loadTracks,
    nextTrack,
    previousTrack,
    shufflePlaylist,
    setTrackByIndex,
    setTrackById,
  };
};
