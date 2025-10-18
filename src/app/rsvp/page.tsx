'use client';

import Layout from '@/components/layout/Layout';
import { VStack, Text, Box } from '@chakra-ui/react';

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

        <Box p={6} bg="gray.50" borderRadius="lg" w="full">
          <Text fontSize="lg" textAlign="center" color="gray.700">
            RSVP Form Coming Soon
          </Text>
          <Text fontSize="sm" textAlign="center" color="gray.500" mt={2}>
            This will include form fields for name, attendance, guest count, and
            message
          </Text>
        </Box>
      </VStack>
    </Layout>
  );
}
