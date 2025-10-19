'use client';

import { VStack, Text, Box } from '@chakra-ui/react';
import { RSVPForm } from '@/components/forms/RSVPForm';

export default function RSVPSection() {
  return (
    <VStack spacing={8} py={12}>
      <Box>
        <Text
          fontSize={{ base: '3xl', sm: '4xl' }}
          fontWeight="bold"
          color="brand.600"
          mb={4}
        >
          RSVP
        </Text>
        <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.600" px={2}>
          Please let us know if you can join us for our special day
        </Text>
      </Box>

      <RSVPForm />
    </VStack>
  );
}
