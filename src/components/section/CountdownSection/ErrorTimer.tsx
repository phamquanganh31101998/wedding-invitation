'use client';

import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import type { CountdownSizeConfig } from '@/types';

interface ErrorTimerProps {
  config: CountdownSizeConfig;
  className?: string;
}

export default function ErrorTimer({ config, className }: ErrorTimerProps) {
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
