'use client';

import Layout from '@/components/layout/Layout';
import { VStack, Text, Box, SimpleGrid } from '@chakra-ui/react';

export default function Gallery() {
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
            Our Story
          </Text>
          <Text fontSize={{ base: 'md', sm: 'lg' }} color="gray.600">
            Moments that led us to this beautiful journey
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Box
              key={index}
              h={{ base: '200px', sm: '180px' }}
              bg="gray.100"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500" fontSize="sm">
                Photo {index}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Text fontSize="xs" color="gray.500" textAlign="center" px={2}>
          Photo gallery will showcase engagement photos, couple photos, and
          memories
        </Text>
      </VStack>
    </Layout>
  );
}
