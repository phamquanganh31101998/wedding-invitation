'use client';

import React, { memo, useMemo } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import type { CountdownTimerProps, CountdownSizeConfigs } from '@/types';
import ErrorTimer from './ErrorTimer';
import TodayTimer from './TodayTimer';
import PastTimer from './PastTimer';
import CountingTimer from './CountingTimer';

const CountdownTimer = memo(function CountdownTimer({
  targetDate,
  className,
  size = 'md',
}: CountdownTimerProps) {
  const { days, isToday, isPast, error } = useCountdown(targetDate);

  // Memoize size configurations to prevent unnecessary re-renders
  const sizeConfig: CountdownSizeConfigs = useMemo(
    () => ({
      sm: {
        containerPadding: 4,
        titleSize: 'md',
        numberSize: 'xl',
        maxWidth: 'sm',
      },
      md: {
        containerPadding: 6,
        titleSize: 'lg',
        numberSize: '2xl',
        maxWidth: 'md',
      },
      lg: {
        containerPadding: 8,
        titleSize: 'xl',
        numberSize: '3xl',
        maxWidth: 'lg',
      },
    }),
    []
  );

  const config = useMemo(() => sizeConfig[size], [sizeConfig, size]);

  // Handle error state
  if (error) {
    return <ErrorTimer config={config} className={className} />;
  }

  // Handle "today is the day" state
  if (isToday) {
    return <TodayTimer config={config} className={className} />;
  }

  // Handle past date state
  if (isPast) {
    return <PastTimer config={config} className={className} />;
  }

  // Handle counting state (future dates)
  return <CountingTimer days={days} config={config} className={className} />;
});

export default CountdownTimer;
