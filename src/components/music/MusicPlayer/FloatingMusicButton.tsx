'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  IconButton,
  Spinner,
  useColorModeValue,
  Box,
  VisuallyHidden,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaExclamationTriangle } from 'react-icons/fa';
import { MusicPlayerProps } from '@/types';
import { useAudioContext } from './AudioContext';

/**
 * Floating music button component that provides play/pause controls
 * Positioned at bottom-left of the screen with smooth animations
 * Fully integrated with Chakra UI theme system
 */
export const FloatingMusicButton: React.FC<MusicPlayerProps> = () => {
  const { state, controls } = useAudioContext();
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const previousPlayingState = useRef<boolean>(state.isPlaying);
  const previousTrack = useRef<string | null>(
    state.currentTrack?.title || null
  );

  // Theme-aware colors using Chakra's color system
  const bgColor = useColorModeValue('brand.500', 'brand.600');
  const hoverBgColor = useColorModeValue('brand.600', 'brand.700');
  const activeBgColor = useColorModeValue('brand.700', 'brand.800');
  const textColor = useColorModeValue('white', 'white');
  const shadowColor = useColorModeValue('brand.200', 'brand.900');
  const focusColor = useColorModeValue('brand.300', 'brand.400');

  // Error state colors
  const errorBgColor = useColorModeValue('red.500', 'red.600');
  const errorHoverBgColor = useColorModeValue('red.600', 'red.700');
  const errorActiveBgColor = useColorModeValue('red.700', 'red.800');
  const errorShadowColor = useColorModeValue('red.200', 'red.900');
  const disabledBgColor = useColorModeValue('gray.300', 'gray.600');

  // High contrast colors for accessibility
  const highContrastBgColor = useColorModeValue('black', 'white');
  const highContrastTextColor = useColorModeValue('white', 'black');
  const highContrastFocusColor = useColorModeValue('yellow', 'yellow');
  const highContrastBorderColor = useColorModeValue('white', 'black');

  // Handle play/pause toggle
  const handleToggle = useCallback(() => {
    if (state.isPlaying) {
      controls.pause();
    } else {
      controls.play();
    }
  }, [state.isPlaying, controls]);

  // Determine icon based on state
  const getIcon = () => {
    if (state.isLoading) {
      return <Spinner size="sm" color={textColor} thickness="2px" />;
    }
    if (state.hasError) {
      return <FaExclamationTriangle fontSize="14px" />;
    }
    return state.isPlaying ? <FaPause /> : <FaPlay />;
  };

  // Determine aria-label based on state
  const getAriaLabel = () => {
    const trackInfo = state.currentTrack
      ? ` - ${state.currentTrack.title}`
      : '';

    if (state.isLoading) {
      return `Loading music${trackInfo}`;
    }
    if (state.hasError) {
      return `Music player error${trackInfo} - click to retry`;
    }
    return state.isPlaying
      ? `Pause music${trackInfo}`
      : `Play music${trackInfo}`;
  };

  // Get detailed description for screen readers
  const getAriaDescription = () => {
    if (state.playlist.length === 0) {
      return 'No music available';
    }

    const trackInfo = state.currentTrack
      ? `Currently loaded: ${state.currentTrack.title}`
      : 'No track selected';

    const playlistInfo = `Playlist has ${state.playlist.length} track${state.playlist.length !== 1 ? 's' : ''}`;

    return `${trackInfo}. ${playlistInfo}. Use space or enter to toggle playback.`;
  };

  // Enhanced click handler with error recovery
  const handleClick = useCallback(() => {
    if (state.hasError) {
      // Reset error state and try to play
      controls.play();
    } else {
      handleToggle();
    }
  }, [state.hasError, controls, handleToggle]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Handle space and enter keys for play/pause toggle
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault(); // Prevent page scroll on space
        handleClick();
      }
    },
    [handleClick]
  );

  // Live region updates for screen readers
  useEffect(() => {
    if (!liveRegionRef.current) return;

    let announcement = '';

    // Announce playback state changes
    if (previousPlayingState.current !== state.isPlaying) {
      if (state.isPlaying) {
        announcement = state.currentTrack
          ? `Now playing: ${state.currentTrack.title}`
          : 'Music started';
      } else if (!state.isLoading && !state.hasError) {
        announcement = 'Music paused';
      }
      previousPlayingState.current = state.isPlaying;
    }

    // Announce track changes
    const currentTrackTitle = state.currentTrack?.title || null;
    if (previousTrack.current !== currentTrackTitle && currentTrackTitle) {
      announcement = `Track changed to: ${currentTrackTitle}`;
      previousTrack.current = currentTrackTitle;
    }

    // Announce loading state
    if (state.isLoading) {
      announcement = 'Loading music...';
    }

    // Announce errors
    if (state.hasError) {
      announcement = 'Music playback error. Press to retry.';
    }

    // Update live region
    if (announcement) {
      liveRegionRef.current.textContent = announcement;

      // Clear the announcement after a delay to allow for new announcements
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, [state.isPlaying, state.currentTrack, state.isLoading, state.hasError]);

  // Don't render if no playlist is available
  if (!state.playlist || state.playlist.length === 0) {
    return null;
  }

  return (
    <>
      {/* Live region for screen reader announcements */}
      <VisuallyHidden>
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          role="status"
        />
      </VisuallyHidden>

      <Box
        position="fixed"
        bottom={{ base: 4, sm: 5, md: 6, lg: 8 }}
        zIndex="overlay"
        // Position at bottom right following page layout constraints
        right={{
          base: 4, // Mobile: 16px from right edge (full width layout)
          sm: 'calc(50vw - 210px + 24px)', // Tablet+: align with right edge of 420px centered container
        }}
        // Prevent overflow on very small screens
        maxW="calc(100vw - 32px)"
      >
        <IconButton
          aria-label={getAriaLabel()}
          aria-describedby="music-player-description"
          aria-pressed={state.isPlaying}
          aria-live="polite"
          role="button"
          tabIndex={0}
          size={{ base: 'md', sm: 'lg', md: 'lg' }}
          isRound
          variant="solid"
          colorScheme="brand"
          bg={bgColor}
          color={textColor}
          icon={getIcon()}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          isDisabled={state.isLoading}
          _hover={{
            bg: hoverBgColor,
            transform: 'scale(1.05)',
            boxShadow: `0 8px 25px -8px ${shadowColor}`,
          }}
          _active={{
            bg: activeBgColor,
            transform: 'scale(0.95)',
          }}
          _focus={{
            boxShadow: `0 0 0 3px ${focusColor}`,
            outline: 'none',
            ring: '3px',
            ringColor: focusColor,
            ringOffset: '2px',
          }}
          _focusVisible={{
            boxShadow: `0 0 0 3px ${focusColor}`,
            outline: 'none',
            ring: '3px',
            ringColor: focusColor,
            ringOffset: '2px',
          }}
          _disabled={{
            opacity: 0.6,
            cursor: 'not-allowed',
            bg: disabledBgColor,
            _hover: {
              transform: 'none',
              bg: disabledBgColor,
              boxShadow: 'none',
            },
            _focus: {
              boxShadow: 'none',
              ring: 'none',
            },
          }}
          // Error state styling
          {...(state.hasError && {
            bg: errorBgColor,
            _hover: {
              bg: errorHoverBgColor,
              transform: 'scale(1.05)',
              boxShadow: `0 8px 25px -8px ${errorShadowColor}`,
            },
            _active: {
              bg: errorActiveBgColor,
              transform: 'scale(0.95)',
            },
          })}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          boxShadow={`0 4px 12px -4px ${shadowColor}`}
          // Responsive sizing using theme breakpoints
          w={{ base: '48px', sm: '56px', md: '56px' }}
          h={{ base: '48px', sm: '56px', md: '56px' }}
          minW={{ base: '48px', sm: '56px', md: '56px' }}
          fontSize={{ base: 'sm', sm: 'md', md: 'md' }}
          // Ensure proper touch targets on mobile and accessibility preferences
          sx={{
            '@media (hover: none)': {
              _hover: {
                transform: 'none',
              },
              _active: {
                transform: 'scale(0.95)',
              },
            },
            // High contrast mode support
            '@media (prefers-contrast: high)': {
              bg: highContrastBgColor,
              color: highContrastTextColor,
              border: `2px solid ${highContrastBorderColor}`,
              _hover: {
                bg: highContrastBgColor,
                color: highContrastTextColor,
                transform: 'none',
                boxShadow: `0 0 0 4px ${highContrastFocusColor}`,
              },
              _focus: {
                boxShadow: `0 0 0 4px ${highContrastFocusColor}`,
                outline: `2px solid ${highContrastFocusColor}`,
                outlineOffset: '2px',
              },
              _focusVisible: {
                boxShadow: `0 0 0 4px ${highContrastFocusColor}`,
                outline: `2px solid ${highContrastFocusColor}`,
                outlineOffset: '2px',
              },
            },
            // Reduced motion support
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              _hover: {
                transform: 'none',
              },
              _active: {
                transform: 'none',
              },
            },
            // Combined high contrast and reduced motion
            '@media (prefers-contrast: high) and (prefers-reduced-motion: reduce)':
              {
                bg: highContrastBgColor,
                color: highContrastTextColor,
                border: `2px solid ${highContrastBorderColor}`,
                transition: 'none',
                _hover: {
                  bg: highContrastBgColor,
                  color: highContrastTextColor,
                  transform: 'none',
                  boxShadow: `0 0 0 4px ${highContrastFocusColor}`,
                },
                _active: {
                  transform: 'none',
                },
                _focus: {
                  boxShadow: `0 0 0 4px ${highContrastFocusColor}`,
                  outline: `2px solid ${highContrastFocusColor}`,
                  outlineOffset: '2px',
                },
              },
          }}
        />

        {/* Hidden description for screen readers */}
        <VisuallyHidden>
          <div id="music-player-description">{getAriaDescription()}</div>
        </VisuallyHidden>
      </Box>
    </>
  );
};
