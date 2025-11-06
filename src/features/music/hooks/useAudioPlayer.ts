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

  // Handle track ended event (separate effect to get current playlist state)
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTrackEnded = () => {
      console.log('🎵 Track ended! Playlist length:', playlist.length);

      // Only auto-advance if there are multiple tracks in playlist
      if (playlist.length > 1) {
        console.log('🎵 Multiple tracks detected, advancing to next track');
        controls.nextTrack();
        // Keep playing state true so the next track auto-plays
      } else if (playlist.length === 1) {
        // If only one track, replay it from the beginning
        console.log('🎵 Single track detected, replaying from start');
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((error) => {
            console.error('Failed to replay track:', error);
            controls.pause();
          });
        }
      } else {
        // No tracks available, just pause
        console.log('🎵 No tracks available, pausing');
        controls.pause();
      }
    };

    audioRef.current.addEventListener('ended', handleTrackEnded);

    return () => {
      audioRef.current?.removeEventListener('ended', handleTrackEnded);
    };
  }, [playlist.length, controls]);

  // Update audio source when current track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      console.log('Loading new track:', currentTrack.title);

      // Validate URL before setting
      if (!currentTrack.url || currentTrack.url.trim() === '') {
        console.error('Invalid track URL:', currentTrack.url);
        controls.setError(true);
        return;
      }

      audioRef.current.src = currentTrack.url;
      audioRef.current.load();

      // If music should be playing, start playing the new track once it's loaded
      if (isPlaying) {
        const handleCanPlay = () => {
          if (audioRef.current && isPlaying) {
            console.log('Auto-playing new track:', currentTrack.title);
            audioRef.current.play().catch((error) => {
              console.error('Failed to auto-play new track:', error);
              controls.pause();
            });
          }
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
        };

        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  }, [currentTrack, controls, isPlaying]);

  // Handle play/pause state changes (but not track changes, those are handled above)
  useEffect(() => {
    if (!audioRef.current || !currentTrack || hasError) {
      return;
    }

    if (isPlaying) {
      // Only play if the audio is ready (to avoid conflicts with track loading)
      if (audioRef.current.readyState >= 2) {
        console.log('Playing track:', currentTrack?.title);
        audioRef.current.play().catch((error) => {
          console.error('Play failed:', error);
          controls.pause();
        });
      }
      // If not ready, the canplay event handler in the track change effect will handle it
    } else {
      console.log('Pausing audio');
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, hasError, controls]);

  return audioRef.current;
};
