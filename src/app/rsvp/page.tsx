'use client';

import Layout from '@/components/layout/Layout';
import { Container, VStack, Text, Box } from '@chakra-ui/react';

export default function RSVP() {
  return (
    <Layout>
      <Container maxW="4xl" py={12}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="bold" color="brand.600" mb={4}>
              RSVP
            </Text>
            <Text fontSize="lg" color="gray.600">
              Please let us know if you can join us for our special day
            </Text>
          </Box>

          <Box p={8} bg="gray.50" borderRadius="lg" w="full" maxW="md">
            <Text fontSize="lg" textAlign="center" color="gray.700">
              RSVP Form Coming Soon
            </Text>
            <Text fontSize="sm" textAlign="center" color="gray.500" mt={2}>
              This will include form fields for name, attendance, guest count,
              and message
            </Text>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}
