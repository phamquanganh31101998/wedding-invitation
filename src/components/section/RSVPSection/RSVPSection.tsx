'use client';

import { VStack, Text, Box } from '@chakra-ui/react';
import { RSVPForm } from '@/components/forms/RSVPForm';
import { RSVPData } from '@/types';

interface RSVPSectionProps {
  guestId?: string | null;
  guest?: RSVPData | null;
}

export default function RSVPSection({ guestId, guest }: RSVPSectionProps) {
  return (
    <VStack spacing={8}>
      <Box>
        <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.600" px={2}>
          Vui lòng cho chúng tôi biết bạn có thể tham dự ngày đặc biệt của chúng
          tôi không
        </Text>
      </Box>

      <RSVPForm guestId={guestId} initialData={guest} />
    </VStack>
  );
}
