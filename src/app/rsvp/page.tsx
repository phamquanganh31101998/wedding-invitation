'use client';

import Layout from '@/components/layout/Layout';
import { VStack, Text, Box } from '@chakra-ui/react';
import RSVPForm from '@/components/forms/RSVPForm';

export default function RSVP() {
  return (
    <Layout>
      <VStack spacing={8} py={12}>
        <Box textAlign="center">
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
    </Layout>
  );
}
