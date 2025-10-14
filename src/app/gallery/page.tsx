'use client';

import Layout from '@/components/layout/Layout';
import { Container, VStack, Text, Box, SimpleGrid } from '@chakra-ui/react';

export default function Gallery() {
  return (
    <Layout>
      <Container maxW="6xl" py={12}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="bold" color="brand.600" mb={4}>
              Our Story
            </Text>
            <Text fontSize="lg" color="gray.600">
              Moments that led us to this beautiful journey
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Box
                key={index}
                h="300px"
                bg="gray.100"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.500">Photo {index}</Text>
              </Box>
            ))}
          </SimpleGrid>

          <Text fontSize="sm" color="gray.500" textAlign="center" maxW="lg">
            Photo gallery will showcase engagement photos, couple photos, and
            memories
          </Text>
        </VStack>
      </Container>
    </Layout>
  );
}
