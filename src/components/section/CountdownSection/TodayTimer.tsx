'use client';

import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import type { CountdownSizeConfig } from '@/types';

interface TodayTimerProps {
  config: CountdownSizeConfig;
  className?: string;
}

export default function TodayTimer({ config, className }: TodayTimerProps) {
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
          Đếm Ngược Đến Ngày Trọng Đại
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
          <span aria-label="Hôm nay là ngày cưới! Biểu tượng ăn mừng">
            Hôm nay là ngày trọng đại! 🎉
          </span>
        </Text>
      </VStack>
    </Box>
  );
}
