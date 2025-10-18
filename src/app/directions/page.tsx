'use client';

import Layout from '@/components/layout/Layout';
import { VStack, Text, Box, Button } from '@chakra-ui/react';

export default function Directions() {
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
            Venue & Directions
          </Text>
          <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.600" px={2}>
            Find your way to our celebration
          </Text>
        </Box>

        <VStack spacing={6} w="full">
          <Box p={6} bg="gray.50" borderRadius="lg" w="full">
            <Text
              fontSize={{ base: 'lg', sm: 'xl' }}
              fontWeight="semibold"
              mb={2}
            >
              [Venue Name]
            </Text>
            <Text color="gray.600" mb={4} fontSize="sm">
              [Venue Address]
              <br />
              [City, State ZIP]
            </Text>
            <VStack spacing={3} align="stretch">
              <Button colorScheme="brand" size="sm" w="full">
                Get Directions
              </Button>
              <Button variant="outline" size="sm" w="full">
                View on Map
              </Button>
            </VStack>
          </Box>

          <Box
            h="300px"
            bg="gray.100"
            borderRadius="lg"
            w="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.500" fontSize="sm">
              Map Integration Coming Soon
            </Text>
          </Box>

          <Box p={6} bg="blue.50" borderRadius="lg" w="full">
            <Text
              fontSize={{ base: 'md', sm: 'lg' }}
              fontWeight="semibold"
              mb={2}
              color="blue.800"
            >
              Parking & Transportation
            </Text>
            <Text color="blue.700" fontSize="sm">
              Free parking is available on-site. Rideshare services are also
              recommended for convenience.
            </Text>
          </Box>
        </VStack>
      </VStack>
    </Layout>
  );
}
