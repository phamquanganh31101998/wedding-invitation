'use client';

import { useState, useEffect } from 'react';
import { differenceInDays, isToday, isPast, isValid } from 'date-fns';
import type { UseCountdownReturn } from '@/types';

export function useCountdown(targetDate: Date): UseCountdownReturn {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      try {
        // Validate target date
        if (!targetDate || !isValid(targetDate)) {
          setDays(0);
          return;
        }

        const now = new Date();
        const daysRemaining = differenceInDays(targetDate, now);
        setDays(Math.max(0, daysRemaining));
      } catch (error) {
        console.warn('Error calculating countdown:', error);
        setDays(0);
      }
    };

    // Calculate immediately
    calculateDays();

    // Update daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    let intervalId: NodeJS.Timeout | null = null;

    const timeoutId = setTimeout(() => {
      calculateDays();
      // Set up daily interval after first midnight
      intervalId = setInterval(calculateDays, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [targetDate]);

  // Calculate derived values
  const todayCheck =
    targetDate && isValid(targetDate) ? isToday(targetDate) : false;
  const pastCheck =
    targetDate && isValid(targetDate)
      ? isPast(targetDate) && !todayCheck
      : false;
  const hasError = !targetDate || !isValid(targetDate);

  return {
    days,
    isToday: todayCheck,
    isPast: pastCheck,
    error: hasError ? 'Invalid target date provided' : undefined,
    errorType: hasError ? 'validation' : undefined,
  };
}
