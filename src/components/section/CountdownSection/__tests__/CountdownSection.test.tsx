import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CountdownSection from '../CountdownSection';
import { addDays } from 'date-fns';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

// Mock the useCountdown hook to avoid timer issues in tests
jest.mock('@/hooks/useCountdown');
import { useCountdown } from '@/hooks/useCountdown';

const mockUseCountdown = useCountdown as jest.MockedFunction<
  typeof useCountdown
>;

describe('CountdownSection', () => {
  beforeEach(() => {
    mockUseCountdown.mockClear();
  });

  it('should render CountdownTimer wrapped in error boundary', () => {
    mockUseCountdown.mockReturnValue({
      days: 5,
      isToday: false,
      isPast: false,
    });

    const futureDate = addDays(new Date(), 5);
    renderWithChakra(<CountdownSection targetDate={futureDate} />);

    expect(
      screen.getByText('Đếm Ngược Đến Ngày Trọng Đại')
    ).toBeInTheDocument();
    expect(screen.getByText('Còn 5 ngày nữa!')).toBeInTheDocument();
  });

  it('should handle error states gracefully', () => {
    mockUseCountdown.mockReturnValue({
      days: 0,
      isToday: false,
      isPast: false,
      error: 'Invalid date',
    });

    const invalidDate = new Date('invalid');
    renderWithChakra(<CountdownSection targetDate={invalidDate} />);

    expect(
      screen.getByText('Đếm Ngược Đến Ngày Trọng Đại')
    ).toBeInTheDocument();
    expect(screen.getByText('Đám cưới sắp diễn ra!')).toBeInTheDocument();
  });

  it('should pass targetDate to CountdownTimer', () => {
    mockUseCountdown.mockReturnValue({
      days: 10,
      isToday: false,
      isPast: false,
    });

    const targetDate = addDays(new Date(), 10);
    renderWithChakra(<CountdownSection targetDate={targetDate} />);

    expect(mockUseCountdown).toHaveBeenCalledWith(targetDate);
  });
});
