'use client';

import React from 'react';
import { MusicPlayerProps } from '@/types';
import { AudioProvider } from './AudioContext';
import { FloatingMusicButton } from './FloatingMusicButton';

/**
 * Main Music Player component that provides audio functionality
 * across the wedding website
 */
export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  theme = 'light',
}) => {
  return (
    <AudioProvider>
      <FloatingMusicButton theme={theme} />
    </AudioProvider>
  );
};
