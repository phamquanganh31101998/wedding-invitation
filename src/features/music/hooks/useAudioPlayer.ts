'use client';
import { useEffect, useRef } from 'react';
import { useAudioContext } from '../components/AudioContext';

/**
 * Custom hook that manages the actual HTML5 audio element
 * and syncs it with AudioContext state
 */
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const savedPositionRef = useRef<number>(0);
  const currentTrackIdRef = useRef<string | null>(null);
  const { state, controls } = useAudioContext();
  const { isPlaying, currentTrack, hasError, playlist } = state;

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle track ended event
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTrackEnded = () => {
      console.log('🎵 Track ended! Playlist length:', playlist.length);

      // Reset saved position since track ended naturally
      savedPositionRef.current = 0;

      if (playlist.length > 1) {
        console.log('🎵 Multiple tracks detected, advancing to next track');
        controls.nextTrack();
      } else if (playlist.length === 1) {
        console.log('🎵 Single track detected, replaying from start');
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((error) => {
            console.error('Failed to replay track:', error);
            controls.pause();
          });
        }
      } else {
        console.log('🎵 No tracks available, pausing');
        controls.pause();
      }
    };

    audioRef.current.addEventListener('ended', handleTrackEnded);

    return () => {
      audioRef.current?.removeEventListener('ended', handleTrackEnded);
    };
  }, [playlist.length, controls]);

  // Handle track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    // Validate URL
    if (!currentTrack.url || currentTrack.url.trim() === '') {
      console.error('Invalid track URL:', currentTrack.url);
      controls.setError(true);
      return;
    }

    // Check if this is a new track
    const isNewTrack = currentTrackIdRef.current !== currentTrack.id;

    if (isNewTrack) {
      console.log('🎵 Loading new track:', currentTrack.title);
      // Reset position for new tracks
      savedPositionRef.current = 0;
      currentTrackIdRef.current = currentTrack.id;

      // Load new track
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
    } else {
      console.log('🎵 Same track, no need to reload');
    }
  }, [currentTrack, controls]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack || hasError) {
      return;
    }

    if (isPlaying) {
      const playAudio = () => {
        if (!audioRef.current) return;

        // Restore saved position if we have one
        if (savedPositionRef.current > 0) {
          console.log('🔄 Restoring position:', savedPositionRef.current);
          audioRef.current.currentTime = savedPositionRef.current;
          savedPositionRef.current = 0; // Clear after restoring
        }

        console.log('▶️ Playing from position:', audioRef.current.currentTime);
        audioRef.current.play().catch((error) => {
          console.error('Play failed:', error);
          controls.pause();
        });
      };

      // Play immediately if ready, otherwise wait
      if (audioRef.current.readyState >= 2) {
        playAudio();
      } else {
        const handleCanPlay = () => {
          playAudio();
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    } else {
      // Save current position before pausing
      if (audioRef.current.currentTime > 0) {
        savedPositionRef.current = audioRef.current.currentTime;
        console.log('⏸️ Pausing at position:', savedPositionRef.current);
      }
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, hasError, controls]);

  return audioRef.current;
};
