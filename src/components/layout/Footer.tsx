'use client';

import { Box, Container, Text, VStack, HStack, Link } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="gray.50" mt="auto">
      <Container maxW="7xl" px={{ base: 4, md: 8 }} py={8}>
        <VStack spacing={4}>
          <HStack spacing={6} flexWrap="wrap" justify="center">
            <Link href="/" _hover={{ color: 'brand.600' }}>
              Home
            </Link>
            <Link href="/rsvp" _hover={{ color: 'brand.600' }}>
              RSVP
            </Link>
            <Link href="/gallery" _hover={{ color: 'brand.600' }}>
              Gallery
            </Link>
            <Link href="/directions" _hover={{ color: 'brand.600' }}>
              Directions
            </Link>
          </HStack>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            © 2025 Our Wedding. Made with love.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Footer;
