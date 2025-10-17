'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { differenceInDays, isToday, isPast, isValid } from 'date-fns';
import type { UseCountdownReturn } from '@/types';

export function useCountdown(targetDate: Date): UseCountdownReturn {
  const [countdownState, setCountdownState] = useState<UseCountdownReturn>({
    days: 0,
    isToday: false,
    isPast: false,
  });

  // Memoize target date validation to prevent unnecessary recalculations
  const isValidTargetDate = useMemo(() => {
    try {
      // Additional validation for edge cases
      if (!targetDate || !(targetDate instanceof Date)) {
        return false;
      }

      // Check if the date is valid and not NaN
      if (!isValid(targetDate) || isNaN(targetDate.getTime())) {
        return false;
      }

      // Check for reasonable date range (not too far in past/future)
      const now = new Date();
      const yearsDifference = Math.abs(
        targetDate.getFullYear() - now.getFullYear()
      );

      // Reject dates more than 100 years in the past or future (edge case protection)
      if (yearsDifference > 100) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }, [targetDate]);

  // Memoize the calculation function to prevent unnecessary re-creations
  const calculateCountdown = useCallback(() => {
    try {
      // Validate the target date
      if (!isValidTargetDate) {
        setCountdownState((prevState) => {
          const newState = {
            days: 0,
            isToday: false,
            isPast: false,
            error: 'Invalid target date provided',
            errorType: 'validation' as const,
          };
          // Only update if state actually changed to prevent unnecessary re-renders
          if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
            return newState;
          }
          return prevState;
        });
        return;
      }

      // Use local timezone for consistent calculations
      const now = new Date();

      // Ensure we're working with local timezone dates for consistency
      const localTargetDate = new Date(targetDate.getTime());
      const localNow = new Date(now.getTime());

      // Check if target date is today (using local timezone)
      if (isToday(localTargetDate)) {
        setCountdownState((prevState) => {
          const newState = {
            days: 0,
            isToday: true,
            isPast: false,
          };
          if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
            return newState;
          }
          return prevState;
        });
        return;
      }

      // Check if target date is in the past (using local timezone)
      if (isPast(localTargetDate) && !isToday(localTargetDate)) {
        setCountdownState((prevState) => {
          const newState = {
            days: 0,
            isToday: false,
            isPast: true,
          };
          if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
            return newState;
          }
          return prevState;
        });
        return;
      }

      // Calculate days remaining for future dates (using local timezone)
      const daysRemaining = differenceInDays(localTargetDate, localNow);
      const calculatedDays = Math.max(0, daysRemaining);

      // Additional validation for calculated days
      if (isNaN(calculatedDays) || calculatedDays < 0) {
        throw new Error('Invalid days calculation result');
      }

      setCountdownState((prevState) => {
        const newState = {
          days: calculatedDays,
          isToday: false,
          isPast: false,
        };
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
          return newState;
        }
        return prevState;
      });
    } catch (error) {
      console.warn('Error calculating countdown:', error);

      // Determine error type based on the error
      let errorType: 'calculation' | 'timezone' | 'unknown' = 'unknown';
      let errorMessage = 'Failed to calculate countdown';

      if (error instanceof Error) {
        if (error.message.includes('Invalid days calculation')) {
          errorType = 'calculation';
          errorMessage = 'Unable to calculate days remaining';
        } else if (
          error.message.includes('timezone') ||
          error.message.includes('time')
        ) {
          errorType = 'timezone';
          errorMessage = 'Timezone calculation error';
        }
      }

      setCountdownState((prevState) => {
        const newState = {
          days: 0,
          isToday: false,
          isPast: false,
          error: errorMessage,
          errorType,
        };
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
          return newState;
        }
        return prevState;
      });
    }
  }, [targetDate, isValidTargetDate]);

  useEffect(() => {
    // Calculate immediately
    calculateCountdown();

    // Only set up timers if we have a valid target date
    if (!isValidTargetDate) {
      return;
    }

    // Set up interval to recalculate at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Prevent setting up timers if the time until midnight is too large (edge case protection)
    if (msUntilMidnight > 24 * 60 * 60 * 1000) {
      console.warn(
        'Calculated time until midnight is invalid, skipping timer setup'
      );
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;

    // Set timeout for first midnight, then interval for subsequent days
    const timeoutId = setTimeout(() => {
      calculateCountdown();

      // Set up daily interval after first midnight
      intervalId = setInterval(calculateCountdown, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [calculateCountdown, isValidTargetDate]);

  return countdownState;
}
