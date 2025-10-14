'use client';

import Layout from '@/components/layout/Layout';
import { Container, VStack, Text, Box, HStack, Button } from '@chakra-ui/react';

export default function Directions() {
  return (
    <Layout>
      <Container maxW="4xl" py={12}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="bold" color="brand.600" mb={4}>
              Venue & Directions
            </Text>
            <Text fontSize="lg" color="gray.600">
              Find your way to our celebration
            </Text>
          </Box>

          <VStack spacing={6} w="full">
            <Box p={6} bg="gray.50" borderRadius="lg" w="full">
              <Text fontSize="xl" fontWeight="semibold" mb={2}>
                [Venue Name]
              </Text>
              <Text color="gray.600" mb={4}>
                [Venue Address]
                <br />
                [City, State ZIP]
              </Text>
              <HStack spacing={4}>
                <Button colorScheme="brand" size="sm">
                  Get Directions
                </Button>
                <Button variant="outline" size="sm">
                  View on Map
                </Button>
              </HStack>
            </Box>

            <Box
              h="400px"
              bg="gray.100"
              borderRadius="lg"
              w="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500">Map Integration Coming Soon</Text>
            </Box>

            <Box p={6} bg="blue.50" borderRadius="lg" w="full">
              <Text fontSize="lg" fontWeight="semibold" mb={2} color="blue.800">
                Parking & Transportation
              </Text>
              <Text color="blue.700">
                Free parking is available on-site. Rideshare services are also
                recommended for convenience.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Layout>
  );
}
