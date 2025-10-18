'use client';

import Layout from '@/components/layout/Layout';
import CountdownSection from '@/components/section/CountdownSection';
import { VStack, Text, Button, Box } from '@chakra-ui/react';
import Link from 'next/link';

const TARGET_DATE = new Date('2025-12-29');

export default function Home() {
  return (
    <Layout>
      <VStack spacing={8} textAlign="center" py={12}>
        <Box>
          <Text
            fontSize={{ base: '4xl', sm: '5xl' }}
            fontWeight="bold"
            color="brand.600"
            mb={4}
            lineHeight="shorter"
          >
            We&apos;re Getting Married!
          </Text>
          <Text fontSize={{ base: 'xl', sm: '2xl' }} color="gray.600" mb={2}>
            [Bride Name] & [Groom Name]
          </Text>
          <Text fontSize={{ base: 'lg', sm: 'xl' }} color="gray.500">
            [Wedding Date] • [Venue Location]
          </Text>
        </Box>

        <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.700" px={2}>
          We&apos;re excited to celebrate our special day with you! Join us for
          a day filled with love, laughter, and unforgettable memories.
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
        <CountdownSection targetDate={TARGET_DATE} />
      </VStack>
    </Layout>
  );
}
