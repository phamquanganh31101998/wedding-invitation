'use client';

import { Box, Container, Text, VStack } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="gray.50" mt="auto">
      <Container
        maxW={{
          base: '100%', // Mobile: 100% width
          sm: '420px', // Tablet: 420px max-width
          md: '420px', // Desktop: 420px max-width
          lg: '420px', // Large: 420px max-width
          xl: '420px', // XL: 420px max-width
        }}
        px={{ base: 4, sm: 6 }}
        mx="auto"
        py={6}
      >
        <VStack spacing={4}>
          {/* <HStack spacing={4} flexWrap="wrap" justify="center">
            <Link href="/" _hover={{ color: 'brand.600' }} fontSize="sm">
              Home
            </Link>
            <Link href="/rsvp" _hover={{ color: 'brand.600' }} fontSize="sm">
              RSVP
            </Link>
            <Link href="/gallery" _hover={{ color: 'brand.600' }} fontSize="sm">
              Gallery
            </Link>
            <Link
              href="/directions"
              _hover={{ color: 'brand.600' }}
              fontSize="sm"
            >
              Directions
            </Link>
          </HStack> */}
          <Text fontSize="xs" color="gray.600" textAlign="center">
            © 2025 Đám Cưới Của Chúng Tôi (chú rể tự code)
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Footer;
