'use client';

import Layout from '@/components/layout/Layout';
import { FloatingMusicButton } from '@/components/music/MusicPlayer';
import CountdownSection from '@/components/section/CountdownSection';
import RSVPSection from '@/components/section/RSVPSection';
import {
  VStack,
  Text,
  Box,
  Spinner,
  Container,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useGuest } from '@/hooks/useGuest';
import { useTenant } from '@/components/providers/TenantProvider';
import MapSection from '@/components/section/MapSection';

const DEFAULT_TARGET_DATE = new Date('2025-12-29');

export default function HomeContent() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get('id');
  const {
    tenantId,
    config,
    isLoading: tenantLoading,
    error: tenantError,
  } = useTenant();
  const { guest, loading } = useGuest(guestId, { tenantId });

  const guestName = guest?.name || '';
  const guestGreeting = guestName ? `Xin chào ${guestName}. ` : 'Xin chào. ';

  // Use tenant-specific data if available, otherwise fall back to defaults
  const brideName = config?.brideName || '[Bride Name]';
  const groomName = config?.groomName || '[Groom Name]';
  const weddingDate = config?.weddingDate || '[Wedding Date]';
  const venueName = config?.venue?.name || '[Venue Location]';
  const venueAddress = config?.venue?.address || '';
  const targetDate = config?.weddingDate
    ? new Date(config.weddingDate)
    : DEFAULT_TARGET_DATE;

  // Show tenant error if there's an issue loading tenant data
  if (tenantError) {
    return (
      <Layout>
        <Container maxW="container.md" py={12}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{tenantError}</AlertDescription>
          </Alert>
        </Container>
      </Layout>
    );
  }

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
            {loading || tenantLoading ? (
              <>
                <Spinner size="sm" mr={2} />
                Đang tải...
              </>
            ) : (
              `${guestGreeting}Chúng tôi sắp kết hôn!`
            )}
          </Text>
          <Text fontSize={{ base: 'xl', sm: '2xl' }} color="gray.600" mb={2}>
            {brideName} & {groomName}
          </Text>
          <Text fontSize={{ base: 'lg', sm: 'xl' }} color="gray.500">
            {weddingDate} • {venueName}
            {venueAddress && `, ${venueAddress}`}
          </Text>
        </Box>

        <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.700" px={2}>
          Chúng tôi rất vui mừng được chia sẻ ngày đặc biệt này với bạn! Hãy
          cùng chúng tôi tận hưởng một ngày tràn đầy tình yêu, tiếng cười và
          những kỷ niệm khó quên.
        </Text>

        {/* Countdown Timer with Error Boundary */}
        <CountdownSection targetDate={targetDate} />

        <RSVPSection guestId={guestId} guest={guest} tenantId={tenantId} />

        <FloatingMusicButton />
      </VStack>
    </Layout>
  );
}
