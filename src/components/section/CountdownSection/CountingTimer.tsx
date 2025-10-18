'use client';

import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import type { CountdownSizeConfig } from '@/types';

interface CountingTimerProps {
  days: number;
  config: CountdownSizeConfig;
  className?: string;
}

export default function CountingTimer({
  days,
  config,
  className,
}: CountingTimerProps) {
  const countdownText = `${days} ${days === 1 ? 'day' : 'days'} to go!`;
  const screenReaderText = `${days} ${
    days === 1 ? 'day' : 'days'
  } remaining until the wedding`;

  return (
    <Box
      as="section"
      p={config.containerPadding}
      bg="gray.50"
      borderRadius="lg"
      w="full"
      maxW={config.maxWidth}
      className={className}
      role="region"
      aria-labelledby="countdown-title"
      aria-describedby="countdown-status"
    >
      <VStack spacing={2}>
        <Heading
          id="countdown-title"
          as="h2"
          fontSize={config.titleSize}
          fontWeight="semibold"
          color="gray.700"
        >
          Countdown to Our Big Day
        </Heading>
        <Text
          id="countdown-status"
          fontSize={config.numberSize}
          color="brand.600"
          fontWeight="bold"
          aria-live="polite"
          aria-atomic="true"
          aria-label={screenReaderText}
        >
          {countdownText}
        </Text>
      </VStack>
    </Box>
  );
}
