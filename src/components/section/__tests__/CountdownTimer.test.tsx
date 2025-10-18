import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CountdownTimer from '../CountdownSection/CountdownTimer';
import { addDays } from 'date-fns';

// Mock the useCountdown hook
jest.mock('@/hooks/useCountdown');
import { useCountdown } from '@/hooks/useCountdown';

const mockUseCountdown = useCountdown as jest.MockedFunction<
  typeof useCountdown
>;

// Wrapper component for Chakra UI
const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('CountdownTimer', () => {
  const defaultProps = {
    targetDate: addDays(new Date(), 10),
  };

  beforeEach(() => {
    mockUseCountdown.mockClear();
  });

  describe('Future date rendering', () => {
    it('should render countdown for future dates', () => {
      mockUseCountdown.mockReturnValue({
        days: 10,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('Countdown to Our Big Day')).toBeInTheDocument();
      expect(screen.getByText('10 days to go!')).toBeInTheDocument();
    });

    it('should render singular "day" for single day remaining', () => {
      mockUseCountdown.mockReturnValue({
        days: 1,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('1 day to go!')).toBeInTheDocument();
    });

    it('should render plural "days" for multiple days', () => {
      mockUseCountdown.mockReturnValue({
        days: 42,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('42 days to go!')).toBeInTheDocument();
    });

    it('should handle zero days remaining (but not today)', () => {
      mockUseCountdown.mockReturnValue({
        days: 0,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('0 days to go!')).toBeInTheDocument();
    });
  });

  describe('Today state rendering', () => {
    it('should render celebration message when target date is today', () => {
      mockUseCountdown.mockReturnValue({
        days: 0,
        isToday: true,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('Countdown to Our Big Day')).toBeInTheDocument();
      expect(screen.getByText('Today is the day! 🎉')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for today state', () => {
      mockUseCountdown.mockReturnValue({
        days: 0,
        isToday: true,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Past date rendering', () => {
    it('should render past message when target date has passed', () => {
      mockUseCountdown.mockReturnValue({
        days: 0,
        isToday: false,
        isPast: true,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('Our Wedding Day')).toBeInTheDocument();
      expect(screen.getByText('The wedding has passed')).toBeInTheDocument();
    });
  });

  describe('Error state rendering', () => {
    it('should render fallback message when there is an error', () => {
      mockUseCountdown.mockReturnValue({
        days: 0,
        isToday: false,
        isPast: false,
        error: 'Invalid target date provided',
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('Countdown to Our Big Day')).toBeInTheDocument();
      expect(screen.getByText('Wedding coming soon!')).toBeInTheDocument();
    });

    it('should render fallback for any error message', () => {
      mockUseCountdown.mockReturnValue({
        days: 0,
        isToday: false,
        isPast: false,
        error: 'Failed to calculate countdown',
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('Wedding coming soon!')).toBeInTheDocument();
    });
  });

  describe('Size configurations', () => {
    it('should render with small size configuration', () => {
      mockUseCountdown.mockReturnValue({
        days: 5,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} size="sm" />
        </ChakraWrapper>
      );

      expect(screen.getByText('5 days to go!')).toBeInTheDocument();
    });

    it('should render with large size configuration', () => {
      mockUseCountdown.mockReturnValue({
        days: 5,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} size="lg" />
        </ChakraWrapper>
      );

      expect(screen.getByText('5 days to go!')).toBeInTheDocument();
    });

    it('should default to medium size when no size prop provided', () => {
      mockUseCountdown.mockReturnValue({
        days: 5,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('5 days to go!')).toBeInTheDocument();
    });
  });

  describe('Accessibility features', () => {
    it('should have proper ARIA labels and semantic structure', () => {
      mockUseCountdown.mockReturnValue({
        days: 7,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      // Check for proper heading structure
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Countdown to Our Big Day');
      expect(heading).toHaveAttribute('id', 'countdown-title');

      // Check for region landmark (get the countdown region specifically)
      const regions = screen.getAllByRole('region');
      const countdownRegion = regions.find(
        (region) => region.getAttribute('aria-labelledby') === 'countdown-title'
      );
      expect(countdownRegion).toBeDefined();
      expect(countdownRegion).toHaveAttribute(
        'aria-labelledby',
        'countdown-title'
      );
      expect(countdownRegion).toHaveAttribute(
        'aria-describedby',
        'countdown-status'
      );

      // Check for live region
      const statusText = screen.getByText('7 days to go!');
      expect(statusText).toHaveAttribute('aria-live', 'polite');
      expect(statusText).toHaveAttribute('aria-atomic', 'true');
      expect(statusText).toHaveAttribute('id', 'countdown-status');
    });

    it('should have descriptive screen reader text for countdown', () => {
      mockUseCountdown.mockReturnValue({
        days: 3,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      const statusElement = screen.getByText('3 days to go!');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        '3 days remaining until the wedding'
      );
    });

    it('should have proper screen reader text for single day', () => {
      mockUseCountdown.mockReturnValue({
        days: 1,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      const statusElement = screen.getByText('1 day to go!');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        '1 day remaining until the wedding'
      );
    });

    it('should have proper ARIA label for celebration emoji', () => {
      mockUseCountdown.mockReturnValue({
        days: 0,
        isToday: true,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      const celebrationElement = screen.getByLabelText(
        'Today is the wedding day! Celebration emoji'
      );
      expect(celebrationElement).toBeInTheDocument();
    });
  });

  describe('Custom props', () => {
    it('should apply custom className', () => {
      mockUseCountdown.mockReturnValue({
        days: 5,
        isToday: false,
        isPast: false,
      });

      const { container } = render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} className="custom-countdown" />
        </ChakraWrapper>
      );

      const countdownElement = container.querySelector('.custom-countdown');
      expect(countdownElement).toBeInTheDocument();
    });

    it('should pass target date to useCountdown hook', () => {
      const targetDate = addDays(new Date(), 15);

      mockUseCountdown.mockReturnValue({
        days: 15,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer targetDate={targetDate} />
        </ChakraWrapper>
      );

      expect(mockUseCountdown).toHaveBeenCalledWith(targetDate);
    });
  });

  describe('Integration with useCountdown hook', () => {
    it('should call useCountdown with provided target date', () => {
      const testDate = new Date('2025-12-29');

      mockUseCountdown.mockReturnValue({
        days: 100,
        isToday: false,
        isPast: false,
      });

      render(
        <ChakraWrapper>
          <CountdownTimer targetDate={testDate} />
        </ChakraWrapper>
      );

      expect(mockUseCountdown).toHaveBeenCalledWith(testDate);
      expect(mockUseCountdown).toHaveBeenCalledTimes(1);
    });

    it('should re-render when hook state changes', () => {
      mockUseCountdown.mockReturnValue({
        days: 5,
        isToday: false,
        isPast: false,
      });

      const { rerender } = render(
        <ChakraWrapper>
          <CountdownTimer {...defaultProps} />
        </ChakraWrapper>
      );

      expect(screen.getByText('5 days to go!')).toBeInTheDocument();

      // The component is memoized, so we need to change the target date to trigger a re-render
      const newDate = addDays(new Date(), 4);

      // Simulate hook state change
      mockUseCountdown.mockReturnValue({
        days: 4,
        isToday: false,
        isPast: false,
      });

      rerender(
        <ChakraWrapper>
          <CountdownTimer targetDate={newDate} />
        </ChakraWrapper>
      );

      expect(screen.getByText('4 days to go!')).toBeInTheDocument();
    });
  });
});
