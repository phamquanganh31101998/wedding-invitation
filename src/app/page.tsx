'use client';

import Layout from '@/components/layout/Layout';
import { Container, VStack, Text, Button, Box } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <Container maxW="4xl" py={12}>
        <VStack spacing={8} textAlign="center">
          <Box>
            <Text fontSize="6xl" fontWeight="bold" color="brand.600" mb={4}>
              We're Getting Married!
            </Text>
            <Text fontSize="2xl" color="gray.600" mb={2}>
              [Bride Name] & [Groom Name]
            </Text>
            <Text fontSize="xl" color="gray.500">
              [Wedding Date] • [Venue Location]
            </Text>
          </Box>

          <Text fontSize="lg" maxW="2xl" color="gray.700">
            We're excited to celebrate our special day with you! Join us for a
            day filled with love, laughter, and unforgettable memories.
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

          {/* Countdown Timer Placeholder */}
          <Box p={6} bg="gray.50" borderRadius="lg" w="full" maxW="md">
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Countdown to Our Big Day
            </Text>
            <Text fontSize="2xl" color="brand.600" fontWeight="bold">
              [Countdown Timer]
            </Text>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}
