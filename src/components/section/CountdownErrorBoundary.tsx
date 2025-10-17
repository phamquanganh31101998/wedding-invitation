'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallbackSize?: 'sm' | 'md' | 'lg';
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CountdownErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'CountdownTimer Error Boundary caught an error:',
        error,
        errorInfo
      );
    }
  }

  render() {
    if (this.state.hasError) {
      // Size configurations for fallback UI
      const sizeConfig = {
        sm: {
          containerPadding: 4,
          titleSize: 'md',
          messageSize: 'lg',
          maxWidth: 'sm',
        },
        md: {
          containerPadding: 6,
          titleSize: 'lg',
          messageSize: 'xl',
          maxWidth: 'md',
        },
        lg: {
          containerPadding: 8,
          titleSize: 'xl',
          messageSize: '2xl',
          maxWidth: 'lg',
        },
      };

      const config = sizeConfig[this.props.fallbackSize || 'md'];

      return (
        <Box
          as="section"
          p={config.containerPadding}
          bg="gray.50"
          borderRadius="lg"
          w="full"
          maxW={config.maxWidth}
          role="region"
          aria-labelledby="countdown-error-title"
          aria-describedby="countdown-error-message"
        >
          <VStack spacing={2}>
            <Heading
              id="countdown-error-title"
              as="h2"
              fontSize={config.titleSize}
              fontWeight="semibold"
              color="gray.700"
            >
              Countdown to Our Big Day
            </Heading>
            <Text
              id="countdown-error-message"
              fontSize={config.messageSize}
              color="gray.600"
              fontWeight="bold"
              aria-live="polite"
              aria-atomic="true"
            >
              Wedding coming soon!
            </Text>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default CountdownErrorBoundary;
