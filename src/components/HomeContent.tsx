'use client';

import Layout from '@/components/layout/Layout';
import { FloatingMusicButton } from '@/components/music/MusicPlayer';
import CountdownSection from '@/components/section/CountdownSection';
import RSVPSection from '@/components/section/RSVPSection';
import { VStack, Text, Box, Spinner, Container } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useGuest } from '@/hooks/useGuest';
import MapSection from '@/components/section/MapSection';

const TARGET_DATE = new Date('2025-12-29');

export default function HomeContent() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get('id');
  const { guest, loading } = useGuest(guestId);

  const guestName = guest?.name || '';
  const guestGreeting = guestName ? `Hello ${guestName}. ` : 'Hello. ';

  return (
    <Layout
      extraContent={
        <Container pb={8}>
          <MapSection />
        </Container>
      }
    >
      <VStack spacing={8} textAlign="center" py={12}>
        <Box>
          <Text
            fontSize={{ base: '4xl', sm: '5xl' }}
            fontWeight="bold"
            color="brand.600"
            mb={4}
            lineHeight="shorter"
          >
            {loading ? (
              <>
                <Spinner size="sm" mr={2} />
                Loading...
              </>
            ) : (
              `${guestGreeting}We're Getting Married!`
            )}
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

        {/* Countdown Timer with Error Boundary */}
        <CountdownSection targetDate={TARGET_DATE} />

        <RSVPSection guestId={guestId} guest={guest} />

        <FloatingMusicButton />
      </VStack>
    </Layout>
  );
}
