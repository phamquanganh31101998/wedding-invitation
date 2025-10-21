'use client';
import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setError, nextTrack } from '@/store/slices/audioSlice';

/**
 * Custom hook that manages the actual HTML5 audio element
 * and syncs it with Redux state
 */
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useAppDispatch();
  const { isPlaying, currentTrack, hasError } = useAppSelector(
    (state) => state.audio
  );

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';

      // Add error handler
      audioRef.current.addEventListener('error', () => {
        dispatch(setError(true));
      });

      // Add ended handler - auto play next track
      audioRef.current.addEventListener('ended', () => {
        dispatch(nextTrack());
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [dispatch]);

  // Update audio source when current track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
    }
  }, [currentTrack]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) {
      return;
    }

    if (isPlaying && !hasError) {
      // Check if audio is ready to play
      if (audioRef.current.readyState >= 2) {
        // HAVE_CURRENT_DATA
        audioRef.current.play().catch(() => {
          dispatch(setError(true));
        });
      } else {
        // Wait for audio to be ready
        const handleCanPlay = () => {
          if (audioRef.current && isPlaying) {
            audioRef.current.play().catch(() => {
              dispatch(setError(true));
            });
          }
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, hasError, dispatch]);

  return audioRef.current;
};
