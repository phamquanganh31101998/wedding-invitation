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

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';

      // Add error handler
      audioRef.current.addEventListener('error', () => {
        // Handle error - could add error state management here if needed
        console.error('Audio playback error');
      });

      // Add ended handler - auto play next track
      audioRef.current.addEventListener('ended', () => {
        // For now, just pause when track ends
        // Could implement next track functionality here if needed
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
          console.error('Failed to play audio');
        });
      } else {
        // Wait for audio to be ready
        const handleCanPlay = () => {
          if (audioRef.current && isPlaying) {
            audioRef.current.play().catch(() => {
              console.error('Failed to play audio');
            });
          }
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, hasError]);

  return audioRef.current;
};
