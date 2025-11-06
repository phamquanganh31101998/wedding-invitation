'use client';
import { useEffect, useRef } from 'react';
import { useAudioContext } from '../components/AudioContext';

/**
 * Custom hook that manages the actual HTML5 audio element
 * and syncs it with AudioContext state
 */
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { state, controls } = useAudioContext();
  const { isPlaying, currentTrack, hasError } = state;

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';

      // Simple ended handler
      audioRef.current.addEventListener('ended', () => {
        controls.pause();
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [controls]);

  // Update audio source when current track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      // Validate URL before setting
      if (!currentTrack.url || currentTrack.url.trim() === '') {
        console.error('Invalid track URL:', currentTrack.url);
        controls.setError(true);
        return;
      }

      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
    }
  }, [currentTrack, controls]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack || hasError) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Play failed:', error);
        controls.pause();
      });
    } else {
      console.log('Pausing audio');
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, hasError, controls]);

  return audioRef.current;
};
