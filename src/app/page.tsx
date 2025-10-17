'use client';

import Layout from '@/components/layout/Layout';
import CountdownTimer from '@/components/section/CountdownTimer';
import CountdownErrorBoundary from '@/components/section/CountdownErrorBoundary';
import { Container, VStack, Text, Button, Box } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <Container maxW="4xl" py={12}>
        <VStack spacing={8} textAlign="center">
          <Box>
            <Text fontSize="6xl" fontWeight="bold" color="brand.600" mb={4}>
              We&apos;re Getting Married!
            </Text>
            <Text fontSize="2xl" color="gray.600" mb={2}>
              [Bride Name] & [Groom Name]
            </Text>
            <Text fontSize="xl" color="gray.500">
              [Wedding Date] • [Venue Location]
            </Text>
          </Box>

          <Text fontSize="lg" maxW="2xl" color="gray.700">
            We&apos;re excited to celebrate our special day with you! Join us
            for a day filled with love, laughter, and unforgettable memories.
          </Text>

          <VStack spacing={4}>
            <Link href="/rsvp">
              <Button colorScheme="brand" size="lg" px={8}>
                RSVP Now
              </Button>
            </Link>
            <Text fontSize="sm" color="gray.500">
              Please respond by [RSVP Date]
            </Text>
          </VStack>

          {/* Countdown Timer with Error Boundary */}
          <CountdownErrorBoundary>
            <CountdownTimer targetDate={new Date('2025-12-29')} />
          </CountdownErrorBoundary>
        </VStack>
      </Container>
    </Layout>
  );
}
