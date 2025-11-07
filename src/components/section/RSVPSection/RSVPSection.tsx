'use client';

import { VStack, Text, Box } from '@chakra-ui/react';
import RSVPForm from '@/components/forms/RSVPForm/RSVPForm';
import { RSVPData } from '@/types';

interface RSVPSectionProps {
  guestId?: string | null;
  guest?: RSVPData | null;
  tenantSlug?: string | null;
}

export default function RSVPSection({
  guestId,
  guest,
  tenantSlug,
}: RSVPSectionProps) {
  return (
    <VStack spacing={8}>
      <Box>
        <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.600" px={2}>
          Bạn có thể tham dự hem?
        </Text>
      </Box>

      <RSVPForm guestId={guestId} initialData={guest} tenantSlug={tenantSlug} />
    </VStack>
  );
}
