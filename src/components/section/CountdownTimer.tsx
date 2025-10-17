'use client';

import React, { memo, useMemo } from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { useCountdown } from '@/hooks/useCountdown';
import type { CountdownTimerProps, CountdownSizeConfigs } from '@/types';

const CountdownTimer = memo(function CountdownTimer({
  targetDate,
  className,
  size = 'md',
}: CountdownTimerProps) {
  const { days, isToday, isPast, error } = useCountdown(targetDate);

  // Memoize size configurations to prevent unnecessary re-renders
  const sizeConfig: CountdownSizeConfigs = useMemo(
    () => ({
      sm: {
        containerPadding: 4,
        titleSize: 'md',
        numberSize: 'xl',
        maxWidth: 'sm',
      },
      md: {
        containerPadding: 6,
        titleSize: 'lg',
        numberSize: '2xl',
        maxWidth: 'md',
      },
      lg: {
        containerPadding: 8,
        titleSize: 'xl',
        numberSize: '3xl',
        maxWidth: 'lg',
      },
    }),
    []
  );

  const config = useMemo(() => sizeConfig[size], [sizeConfig, size]);

  // Memoize countdown text to prevent unnecessary re-renders
  const countdownText = useMemo(
    () => `${days} ${days === 1 ? 'day' : 'days'} to go!`,
    [days]
  );

  const screenReaderText = useMemo(
    () => `${days} ${days === 1 ? 'day' : 'days'} remaining until the wedding`,
    [days]
  );

  // Handle error state
  if (error) {
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

  // Handle "today is the day" state
  if (isToday) {
    return (
      <Box
        as="section"
        p={config.containerPadding}
        bg="green.50"
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
            color="green.800"
          >
            Countdown to Our Big Day
          </Heading>
          <Text
            id="countdown-status"
            fontSize={config.numberSize}
            color="green.700"
            fontWeight="bold"
            aria-live="assertive"
            aria-atomic="true"
            role="status"
          >
            <span aria-label="Today is the wedding day! Celebration emoji">
              Today is the day! 🎉
            </span>
          </Text>
        </VStack>
      </Box>
    );
  }

  // Handle past date state
  if (isPast) {
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
            Our Wedding Day
          </Heading>
          <Text
            id="countdown-status"
            fontSize={config.numberSize}
            color="gray.600"
            fontWeight="bold"
            aria-live="polite"
            aria-atomic="true"
          >
            The wedding has passed
          </Text>
        </VStack>
      </Box>
    );
  }

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
});

export default CountdownTimer;
