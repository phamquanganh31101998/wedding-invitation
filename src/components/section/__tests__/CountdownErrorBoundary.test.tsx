import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { CountdownErrorBoundary } from '../CountdownErrorBoundary';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = false,
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component</div>;
};

// Wrapper component for Chakra UI
const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('CountdownErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ChakraWrapper>
        <CountdownErrorBoundary>
          <ThrowError shouldThrow={false} />
        </CountdownErrorBoundary>
      </ChakraWrapper>
    );

    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('should render fallback UI when child component throws an error', () => {
    render(
      <ChakraWrapper>
        <CountdownErrorBoundary>
          <ThrowError shouldThrow={true} />
        </CountdownErrorBoundary>
      </ChakraWrapper>
    );

    expect(screen.getByText('Countdown to Our Big Day')).toBeInTheDocument();
    expect(screen.getByText('Wedding coming soon!')).toBeInTheDocument();
  });

  it('should render fallback UI with correct size configuration', () => {
    render(
      <ChakraWrapper>
        <CountdownErrorBoundary fallbackSize="lg">
          <ThrowError shouldThrow={true} />
        </CountdownErrorBoundary>
      </ChakraWrapper>
    );

    expect(screen.getByText('Countdown to Our Big Day')).toBeInTheDocument();
    expect(screen.getByText('Wedding coming soon!')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes in fallback UI', () => {
    render(
      <ChakraWrapper>
        <CountdownErrorBoundary>
          <ThrowError shouldThrow={true} />
        </CountdownErrorBoundary>
      </ChakraWrapper>
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Countdown to Our Big Day');
    expect(heading).toHaveAttribute('id', 'countdown-error-title');

    const regions = screen.getAllByRole('region');
    const errorRegion = regions.find(
      (region) =>
        region.getAttribute('aria-labelledby') === 'countdown-error-title'
    );
    expect(errorRegion).toBeDefined();
    expect(errorRegion).toHaveAttribute(
      'aria-describedby',
      'countdown-error-message'
    );
  });

  it('should log error in development mode', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Mock NODE_ENV to be development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ChakraWrapper>
        <CountdownErrorBoundary>
          <ThrowError shouldThrow={true} />
        </CountdownErrorBoundary>
      </ChakraWrapper>
    );

    expect(consoleSpy).toHaveBeenCalled();

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });
});
