import { renderHook } from '@testing-library/react';
import { useCountdown } from '../useCountdown';
import { addDays, subDays } from 'date-fns';

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('useCountdown', () => {
  beforeEach(() => {
    // Reset timers before each test
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Future dates', () => {
    it('should calculate days remaining for future dates', () => {
      const futureDate = addDays(new Date(), 10);
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.days).toBe(10);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle single day remaining', () => {
      const tomorrow = addDays(new Date(), 1);
      const { result } = renderHook(() => useCountdown(tomorrow));

      expect(result.current.days).toBe(1);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(false);
    });

    it('should handle large number of days', () => {
      const farFuture = addDays(new Date(), 365);
      const { result } = renderHook(() => useCountdown(farFuture));

      expect(result.current.days).toBe(365);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(false);
    });
  });

  describe('Today scenario', () => {
    it('should detect when target date is today', () => {
      const today = new Date();
      const { result } = renderHook(() => useCountdown(today));

      expect(result.current.days).toBe(0);
      expect(result.current.isToday).toBe(true);
      expect(result.current.isPast).toBe(false);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('Past dates', () => {
    it('should detect when target date is in the past', () => {
      const pastDate = subDays(new Date(), 5);
      const { result } = renderHook(() => useCountdown(pastDate));

      expect(result.current.days).toBe(0);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(true);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle yesterday', () => {
      const yesterday = subDays(new Date(), 1);
      const { result } = renderHook(() => useCountdown(yesterday));

      expect(result.current.days).toBe(0);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(true);
    });
  });

  describe('Invalid dates', () => {
    it('should handle invalid date objects', () => {
      const invalidDate = new Date('invalid');
      const { result } = renderHook(() => useCountdown(invalidDate));

      expect(result.current.days).toBe(0);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(false);
      expect(result.current.error).toBe('Invalid target date provided');
    });

    it('should handle null date', () => {
      // new Date(null) creates 1970-01-01, which is a valid date but in the past
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nullDate = new Date(null as any);
      const { result } = renderHook(() => useCountdown(nullDate));

      expect(result.current.days).toBe(0);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(true);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should never return negative days', () => {
      const pastDate = subDays(new Date(), 100);
      const { result } = renderHook(() => useCountdown(pastDate));

      expect(result.current.days).toBe(0);
      expect(result.current.days).toBeGreaterThanOrEqual(0);
    });

    it('should handle date changes when target date updates', () => {
      const initialDate = addDays(new Date(), 5);
      const { result, rerender } = renderHook(
        ({ targetDate }) => useCountdown(targetDate),
        { initialProps: { targetDate: initialDate } }
      );

      expect(result.current.days).toBe(5);

      // Update to a different future date
      const newDate = addDays(new Date(), 10);
      rerender({ targetDate: newDate });

      expect(result.current.days).toBe(10);
    });

    it('should handle timezone differences gracefully', () => {
      // Create a date in a different timezone (UTC)
      const utcDate = new Date();
      utcDate.setUTCDate(utcDate.getUTCDate() + 7);

      const { result } = renderHook(() => useCountdown(utcDate));

      // Should still calculate correctly regardless of timezone
      expect(result.current.days).toBeGreaterThanOrEqual(6);
      expect(result.current.days).toBeLessThanOrEqual(8);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle calculation errors gracefully', () => {
      // Test with a truly invalid date that will cause isValid to return false
      const invalidDate = new Date('invalid-date-string');
      const { result } = renderHook(() => useCountdown(invalidDate));

      expect(result.current.days).toBe(0);
      expect(result.current.isToday).toBe(false);
      expect(result.current.isPast).toBe(false);
      expect(result.current.error).toBe('Invalid target date provided');
    });
  });

  describe('Timer behavior', () => {
    it('should set up midnight recalculation timer', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const futureDate = addDays(new Date(), 5);
      const { result } = renderHook(() => useCountdown(futureDate));

      // Verify initial state
      expect(result.current.days).toBe(5);

      // Verify that setTimeout was called to set up the midnight timer
      expect(setTimeoutSpy).toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
    });

    it('should cleanup timers on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const futureDate = addDays(new Date(), 5);
      const { unmount } = renderHook(() => useCountdown(futureDate));

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });
});
