import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CountingTimer from '../CountingTimer';

const mockConfig = {
  containerPadding: 6,
  titleSize: 'lg',
  numberSize: '2xl',
  maxWidth: 'md',
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('CountingTimer', () => {
  it('should render countdown for multiple days', () => {
    renderWithChakra(<CountingTimer days={5} config={mockConfig} />);

    expect(screen.getByText('Countdown to Our Big Day')).toBeInTheDocument();
    expect(screen.getByText('5 days to go!')).toBeInTheDocument();
  });

  it('should render singular "day" for single day remaining', () => {
    renderWithChakra(<CountingTimer days={1} config={mockConfig} />);

    expect(screen.getByText('1 day to go!')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithChakra(<CountingTimer days={3} config={mockConfig} />);

    const title = screen.getByText('Countdown to Our Big Day');
    const section = title.closest('[role="region"]');
    expect(section).toHaveAttribute('aria-labelledby', 'countdown-title');
    expect(section).toHaveAttribute('aria-describedby', 'countdown-status');

    const status = screen.getByText('3 days to go!');
    expect(status).toHaveAttribute(
      'aria-label',
      '3 days remaining until the wedding'
    );
  });
});
